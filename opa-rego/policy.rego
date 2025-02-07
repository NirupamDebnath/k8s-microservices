package istio.authz

default allow = false

# Extract the JWT token from the "Authorization" header
jwt_token := input.attributes.request.http.headers["authorization"]

# Remove "Bearer " prefix and decode JWT
jwt_parts := split(jwt_token, " ")
jwt_payload_encoded := split(jwt_parts[1], ".")[1]
jwt_payload_decoded := base64url.decode(jwt_payload_encoded)
jwt_payload := json.unmarshal(jwt_payload_decoded)

# Allow request only if "username" exists
allow if {
    jwt_payload["username"]
}
