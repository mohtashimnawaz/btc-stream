use ic_cdk::api::caller;
use std::collections::HashMap;
use candid::{CandidType, Principal};
use serde::{Serialize, Deserialize};

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
struct CancelResult {
    refund: u64,
    fee: u64,
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
enum ClaimResult {
    #[serde(rename = "ok")]
    Ok(u64),
    #[serde(rename = "err")]
    Err(String),
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
enum TopUpResult {
    #[serde(rename = "ok")]
    Ok(()),
    #[serde(rename = "err")]
    Err(String),
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
enum CancelStreamResult {
    #[serde(rename = "ok")]
    Ok(CancelResult),
    #[serde(rename = "err")]
    Err(String),
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
enum ReclaimResult {
    #[serde(rename = "ok")]
    Ok(u64),
    #[serde(rename = "err")]
    Err(String),
}

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
    last_claim_time: u64, // NEW
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
struct StreamTemplate {
    id: u64,
    name: String,
    description: String,
    duration_secs: u64,
    sats_per_sec: u64,
    creator: Principal,
    created_at: u64,
    usage_count: u64,
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
enum TemplateResult {
    #[serde(rename = "ok")]
    Ok(u64),
    #[serde(rename = "err")]
    Err(String),
}

// Storage for streams
thread_local! {
    static STREAMS: std::cell::RefCell<HashMap<u64, Stream>> = std::cell::RefCell::new(HashMap::new());
    static NEXT_ID: std::cell::RefCell<u64> = std::cell::RefCell::new(0);
}

// Storage for templates
thread_local! {
    static TEMPLATES: std::cell::RefCell<HashMap<u64, StreamTemplate>> = std::cell::RefCell::new(HashMap::new());
    static NEXT_TEMPLATE_ID: std::cell::RefCell<u64> = std::cell::RefCell::new(0);
}

const FEE_PERCENT: f64 = 0.01; // 1% fee
const RECLAIM_TIMEOUT_SECS: u64 = 7 * 24 * 60 * 60; // 7 days

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
        last_claim_time: start_time, // NEW
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
fn claim_stream(stream_id: u64) -> ClaimResult {
    let caller = caller();
    let now = ic_cdk::api::time() / 1_000_000_000;
    STREAMS.with(|streams| {
        let mut streams = streams.borrow_mut();
        match streams.get_mut(&stream_id) {
            None => ClaimResult::Err("Stream not found".to_string()),
            Some(stream) => {
                if stream.recipient != caller {
                    return ClaimResult::Err("Only the recipient can claim".to_string());
                }
                if stream.buffer == 0 {
                    return ClaimResult::Err("No funds to claim".to_string());
                }
                let claimed = stream.buffer;
                stream.buffer = 0;
                stream.last_claim_time = now;
                ClaimResult::Ok(claimed)
            }
        }
    })
}

#[ic_cdk::update]
fn top_up_stream(stream_id: u64, additional_sats: u64) -> TopUpResult {
    let caller = caller();
    STREAMS.with(|streams| {
        let mut streams = streams.borrow_mut();
        match streams.get_mut(&stream_id) {
            None => TopUpResult::Err("Stream not found".to_string()),
            Some(stream) => {
                if stream.sender != caller {
                    return TopUpResult::Err("Only the sender can top up".to_string());
                }
                if stream.status != StreamStatus::Active {
                    return TopUpResult::Err("Stream is not active".to_string());
                }
                stream.total_locked += additional_sats;
                TopUpResult::Ok(())
            }
        }
    })
}

#[ic_cdk::update]
fn cancel_stream(stream_id: u64) -> CancelStreamResult {
    let caller = caller();
    STREAMS.with(|streams| {
        let mut streams = streams.borrow_mut();
        match streams.get_mut(&stream_id) {
            None => CancelStreamResult::Err("Stream not found".to_string()),
            Some(stream) => {
                if stream.sender != caller {
                    return CancelStreamResult::Err("Only the sender can cancel".to_string());
                }
                if stream.status != StreamStatus::Active {
                    return CancelStreamResult::Err("Stream is not active".to_string());
                }
                stream.status = StreamStatus::Cancelled;
                let unused = stream.total_locked.saturating_sub(stream.total_released);
                let fee = (unused as f64 * FEE_PERCENT).round() as u64;
                let refund = unused.saturating_sub(fee);
                CancelStreamResult::Ok(CancelResult { refund, fee })
            }
        }
    })
}

#[ic_cdk::update]
fn reclaim_unclaimed(stream_id: u64) -> ReclaimResult {
    let caller = caller();
    let now = ic_cdk::api::time() / 1_000_000_000;
    STREAMS.with(|streams| {
        let mut streams = streams.borrow_mut();
        match streams.get_mut(&stream_id) {
            None => ReclaimResult::Err("Stream not found".to_string()),
            Some(stream) => {
                if stream.sender != caller {
                    return ReclaimResult::Err("Only the sender can reclaim".to_string());
                }
                if stream.buffer == 0 {
                    return ReclaimResult::Err("No unclaimed funds to reclaim".to_string());
                }
                let claimable_time = stream.end_time.max(stream.last_claim_time) + RECLAIM_TIMEOUT_SECS;
                if now < claimable_time {
                    return ReclaimResult::Err("Reclaim timeout not reached".to_string());
                }
                let reclaimed = stream.buffer;
                stream.buffer = 0;
                ReclaimResult::Ok(reclaimed)
            }
        }
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

#[ic_cdk::update]
fn create_template(name: String, description: String, duration_secs: u64, sats_per_sec: u64) -> TemplateResult {
    let creator = caller();
    let now = ic_cdk::api::time() / 1_000_000_000;
    
    let id = NEXT_TEMPLATE_ID.with(|id| {
        let mut id_mut = id.borrow_mut();
        let curr = *id_mut;
        *id_mut += 1;
        curr
    });
    
    let template = StreamTemplate {
        id,
        name,
        description,
        duration_secs,
        sats_per_sec,
        creator,
        created_at: now,
        usage_count: 0,
    };
    
    TEMPLATES.with(|templates| {
        templates.borrow_mut().insert(id, template);
    });
    
    TemplateResult::Ok(id)
}

#[ic_cdk::update]
fn create_stream_from_template(template_id: u64, recipient: Principal, total_locked: u64) -> u64 {
    TEMPLATES.with(|templates| {
        let mut templates = templates.borrow_mut();
        if let Some(template) = templates.get_mut(&template_id) {
            template.usage_count += 1;
            create_stream(recipient, template.sats_per_sec, template.duration_secs, total_locked)
        } else {
            0 // Handle error properly in real implementation
        }
    })
}

#[ic_cdk::query]
fn list_templates() -> Vec<StreamTemplate> {
    TEMPLATES.with(|templates| {
        templates.borrow().values().cloned().collect()
    })
}
