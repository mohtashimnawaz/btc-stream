use ic_cdk::api::caller;
use std::collections::HashMap;
use ic_cdk::storage;
use candid::Principal;

// Stream status
#[derive(Clone, Debug, PartialEq)]
enum StreamStatus {
    Active,
    Cancelled,
    Completed,
}

// Stream struct
#[derive(Clone, Debug)]
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
