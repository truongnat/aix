// Purpose: POST anonymized telemetry export to remote endpoint.
// Layer: infrastructure
// Depends on: nothing

export interface HttpUploadOptions {
  endpoint: string;
  payload: object;
  authHeader?: string;
}

export interface HttpUploadResult {
  status: number;
}

export async function postJsonPayload(options: HttpUploadOptions): Promise<HttpUploadResult> {
  const response = await fetch(options.endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(options.authHeader ? { authorization: options.authHeader } : {}),
    },
    body: JSON.stringify(options.payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telemetry upload failed (${response.status}): ${body}`);
  }

  return { status: response.status };
}
