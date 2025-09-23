export const c2l = {
  key: "c2l",
  name: "C2L Legal Request",
  preview: "Structured template for new legal service submissions.",
  html: `
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>New submission alert</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f4f4f2; color: #111; }
        .container { max-width: 700px; margin: auto; background: #fff; border-radius: 8px; padding: 20px; }
        h1 { background: #023437; color: #fff; padding: 15px; font-size: 20px; text-align: center; margin: 0 0 20px; }
        .row { margin-bottom: 10px; }
        .label { font-weight: bold; color: #023437; display: inline-block; width: 140px; }
        .badge { background: #023437; color: #fff; padding: 3px 8px; border-radius: 12px; font-size: 12px; }
        pre { background: #EFE4CB; padding: 10px; border-left: 4px solid #C09F53; white-space: pre-wrap; }
        .section { margin-top: 20px; padding: 10px; background: #f9f9f9; border-radius: 6px; }
        a { color: #023437; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>New Legal Service Request</h1>

        <div class="row"><strong>Submitted on:</strong> {{submission_time}} (AEST)</div>

        <div class="row"><span class="label">Full Name:</span> {{from_name}}</div>
        <div class="row"><span class="label">Email:</span> {{to_email}}</div>
        <div class="row"><span class="label">Phone:</span> {{phone_number}}</div>
        <div class="row"><span class="label">Category:</span> <span class="badge">{{concern}}</span></div>

        <div class="section">
          <strong>Case Summary</strong>
          <pre>{{case_history}}</pre>
        </div>

        <div class="section">
          <strong>TrustedForm / Lead Tracking</strong>
          <div>Cert URL: <a href="{{xxTrustedFormCertUrl}}">{{xxTrustedFormCertUrl}}</a></div>
          <div>Ping URL: <a href="{{xxTrustedFormPingUrl}}">{{xxTrustedFormPingUrl}}</a></div>
          <div>Cert Token: {{xxTrustedFormCertToken}}</div>
        </div>

        <div class="section">
          <strong>Request Metadata</strong>
          <div>IP Address: {{ipAddress}}</div>
          <div>Page URL: <a href="{{pageUrl}}">{{pageUrl}}</a></div>
          <div>Initial Landing: <a href="{{initialLandingUrl}}">{{initialLandingUrl}}</a></div>
        </div>
      </div>
    </body>
    </html>
  `,
  config: {},
};
