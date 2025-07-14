use ic_cdk::api::caller;
use std::collections::HashMap;
use ic_cdk::storage;
use candid::{CandidType, Principal};
use serde::{Serialize, Deserialize};

// Stream status
#[derive(Clone, Debug, PartialEq, CandidType, Serialize, Deserialize)]
enum StreamStatus {
    Active,
    Cancelled,
    Completed,
}

// Stream struct
#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
struct Stream {
    id: u64,
    sender: Principal,
    recipient: Principal,
    sats_per_sec: u64,
    start_time: u64,
    end_time: u64,
    total_locked: u64,
    total_released: u64,
    last_release_time: u64,
    buffer: u64,
    status: StreamStatus,
}

// Storage for streams
thread_local! {
    static STREAMS: std::cell::RefCell<HashMap<u64, Stream>> = std::cell::RefCell::new(HashMap::new());
    static NEXT_ID: std::cell::RefCell<u64> = std::cell::RefCell::new(0);
}

#[ic_cdk::update]
fn create_stream(
    recipient: Principal,
    sats_per_sec: u64,
    duration_secs: u64,
    total_locked: u64,
) -> u64 {
    let sender = caller();
    let start_time = ic_cdk::api::time() / 1_000_000_000; // seconds
    let end_time = start_time + duration_secs;
    let id = NEXT_ID.with(|id| {
        let mut id_mut = id.borrow_mut();
        let curr = *id_mut;
        *id_mut += 1;
        curr
    });
    let stream = Stream {
        id,
        sender,
        recipient,
        sats_per_sec,
        start_time,
        end_time,
        total_locked,
        total_released: 0,
        last_release_time: start_time,
        buffer: 0,
        status: StreamStatus::Active,
    };
    STREAMS.with(|streams| {
        streams.borrow_mut().insert(id, stream);
    });
    id
}

#[ic_cdk::query]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}

#[ic_cdk::heartbeat]
fn canister_heartbeat() {
    let now = ic_cdk::api::time() / 1_000_000_000; // seconds
    STREAMS.with(|streams| {
        let mut streams = streams.borrow_mut();
        for stream in streams.values_mut() {
            if stream.status != StreamStatus::Active {
                continue;
            }
            let elapsed = now.saturating_sub(stream.last_release_time);
            if elapsed == 0 {
                continue;
            }
            let releasable = elapsed * stream.sats_per_sec;
            let remaining = stream.total_locked.saturating_sub(stream.total_released);
            let to_release = releasable.min(remaining);
            stream.total_released += to_release;
            stream.last_release_time = now;
            stream.buffer += to_release; // For now, buffer simulates released but unclaimed BTC
            if stream.total_released >= stream.total_locked || now >= stream.end_time {
                stream.status = StreamStatus::Completed;
            }
        }
    });
}

#[ic_cdk::update]
fn claim_stream(stream_id: u64) -> Result<u64, String> {
    let caller = caller();
    STREAMS.with(|streams| {
        let mut streams = streams.borrow_mut();
        let stream = streams.get_mut(&stream_id).ok_or("Stream not found")?;
        if stream.recipient != caller {
            return Err("Only the recipient can claim".to_string());
        }
        if stream.buffer == 0 {
            return Err("No funds to claim".to_string());
        }
        let claimed = stream.buffer;
        stream.buffer = 0;
        Ok(claimed) // Simulate transfer
    })
}

#[ic_cdk::update]
fn top_up_stream(stream_id: u64, additional_sats: u64) -> Result<(), String> {
    let caller = caller();
    STREAMS.with(|streams| {
        let mut streams = streams.borrow_mut();
        let stream = streams.get_mut(&stream_id).ok_or("Stream not found")?;
        if stream.sender != caller {
            return Err("Only the sender can top up".to_string());
        }
        if stream.status != StreamStatus::Active {
            return Err("Stream is not active".to_string());
        }
        stream.total_locked += additional_sats;
        Ok(())
    })
}

#[ic_cdk::update]
fn cancel_stream(stream_id: u64) -> Result<(), String> {
    let caller = caller();
    STREAMS.with(|streams| {
        let mut streams = streams.borrow_mut();
        let stream = streams.get_mut(&stream_id).ok_or("Stream not found")?;
        if stream.sender != caller {
            return Err("Only the sender can cancel".to_string());
        }
        if stream.status != StreamStatus::Active {
            return Err("Stream is not active".to_string());
        }
        stream.status = StreamStatus::Cancelled;
        // Slashing/refund logic: for now, just mark as cancelled
        Ok(())
    })
}

#[ic_cdk::query]
fn get_stream(stream_id: u64) -> Option<Stream> {
    STREAMS.with(|streams| streams.borrow().get(&stream_id).cloned())
}

#[ic_cdk::query]
fn list_streams_for_user() -> Vec<Stream> {
    let user = caller();
    STREAMS.with(|streams| {
        streams
            .borrow()
            .values()
            .filter(|s| s.sender == user || s.recipient == user)
            .cloned()
            .collect()
    })
}
