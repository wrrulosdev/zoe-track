use base64::engine::general_purpose::STANDARD;
use base64::Engine as _;
use reqwest::{
    header::{HeaderMap, HeaderValue, AUTHORIZATION},
    Client,
};
use std::sync::Arc;
use serde::Serialize;

/// Client for sending authenticated HTTP requests to the League Client API (LCU).
///
/// This wrapper handles base URL formatting, headers, and TLS settings for communication
/// with the local League of Legends client.
pub struct LcuRequestClient {
    client: Arc<Client>,
    base_url: String,
}

impl LcuRequestClient {
    /// Create a new authenticated LCU client for a given port and token.
    ///
    /// # Arguments
    ///
    /// * `port` - The port used by the LCU's local HTTPS API.
    /// * `token` - The authentication token provided in the lockfile.
    ///
    /// # Returns
    ///
    /// * `Ok(LcuRequestClient)` - A ready-to-use HTTP client for LCU endpoints.
    /// * `Err(String)` - If the client fails to build or the auth header is invalid.
    pub fn new(port: u16, token: &str) -> Result<Self, String> {
        let base_url = format!("https://127.0.0.1:{}", port);
        let auth_value = format!("Basic {}", STANDARD.encode(format!("riot:{}", token)));

        let mut headers = HeaderMap::new();
        headers.insert(
            AUTHORIZATION,
            HeaderValue::from_str(&auth_value).map_err(|e| e.to_string())?,
        );

        // The LCU uses a self-signed certificate, so we disable TLS validation.
        let client = Client::builder()
            .default_headers(headers)
            .danger_accept_invalid_certs(true)
            .build()
            .map_err(|e| e.to_string())?;

        Ok(Self {
            client: Arc::new(client),
            base_url,
        })
    }

    /// Send a GET request and return the response body as a String.
    ///
    /// # Arguments
    ///
    /// * `endpoint` - The endpoint path (e.g., "/lol-chat/v1/me").
    ///
    /// # Returns
    ///
    /// * `Ok(String)` - The plain response text.
    /// * `Err(String)` - If the request fails or the status is not 2xx.
    pub async fn get(&self, endpoint: &str) -> Result<String, String> {
        let url = format!("{}{}", self.base_url, endpoint);
        self.client
            .get(&url)
            .send()
            .await
            .map_err(|e| e.to_string())?
            .error_for_status()
            .map_err(|e| e.to_string())?
            .text()
            .await
            .map_err(|e| e.to_string())
    }

    /// Send a POST request (without body) and return the response body as a String.
    ///
    /// # Arguments
    ///
    /// * `endpoint` - The endpoint path.
    ///
    /// # Returns
    ///
    /// * `Ok(String)` - The response body.
    /// * `Err(String)` - If the request or status fails.
    pub async fn post(&self, endpoint: &str) -> Result<String, String> {
        // Not used now.
        let url = format!("{}{}", self.base_url, endpoint);
        self.client
            .post(&url)
            .send()
            .await
            .map_err(|e| e.to_string())?
            .error_for_status()
            .map_err(|e| e.to_string())?
            .text()
            .await
            .map_err(|e| e.to_string())
    }

    /// Send a POST request without expecting a response body.
    ///
    /// # Arguments
    ///
    /// * `endpoint` - The endpoint path.
    ///
    /// # Returns
    ///
    /// * `Ok(())` - If the request was successful.
    /// * `Err(String)` - If the request or status fails.
    pub async fn post_empty(&self, endpoint: &str) -> Result<(), String> {
        let url = format!("{}{}", self.base_url, endpoint);
        self.client
            .post(&url)
            .send()
            .await
            .map_err(|e| e.to_string())?
            .error_for_status()
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    /// Sends a PATCH request with a JSON body to the specified endpoint.
    ///
    /// # Arguments
    ///
    /// * `endpoint` - The endpoint path (e.g., "/lol-champ-select/v1/session/actions/{id}").
    /// * `body` - The request body implementing `Serialize`.
    ///
    /// # Returns
    ///
    /// * `Ok(())` if the request was successful.
    /// * `Err(String)` if the request fails or the response is unsuccessful.
    pub async fn patch_json<T: Serialize>(&self, endpoint: &str, body: &T) -> Result<(), String> {
        let url = format!("{}{}", self.base_url, endpoint);
        let response = self
            .client
            .patch(&url)
            .json(body)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        if response.status().is_success() {
            Ok(())
        } else {
            let status = response.status();
            let text = response
                .text()
                .await
                .unwrap_or_else(|_| "<no error body>".to_string());
            Err(format!("HTTP {} Error: {}", status, text))
        }
    }

    /// Send a GET request and deserialize the response JSON into type `T`.
    ///
    /// # Type Parameters
    ///
    /// * `T` - The type to deserialize the JSON response into.
    ///
    /// # Arguments
    ///
    /// * `endpoint` - The endpoint path.
    ///
    /// # Returns
    ///
    /// * `Ok(T)` - If the response is valid JSON and deserializes into `T`.
    /// * `Err(String)` - If the request fails or deserialization fails.
    pub async fn get_json<T: serde::de::DeserializeOwned>(
        &self,
        endpoint: &str,
    ) -> Result<T, String> {
        let url = format!("{}{}", self.base_url, endpoint);
        self.client
            .get(&url)
            .send()
            .await
            .map_err(|e| e.to_string())?
            .error_for_status()
            .map_err(|e| e.to_string())?
            .json::<T>()
            .await
            .map_err(|e| e.to_string())
    }
}
