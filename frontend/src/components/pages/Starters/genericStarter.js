export const genericStarter = {
  key: "generic",
  name: "Generic Starter",
  preview: "A clean, minimal template with standard form fields.",
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>New Submission</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 700px; margin: auto; padding: 20px; }
        h1 { text-align: center; margin-bottom: 20px; }
        .row { margin-bottom: 10px; }
        .label { font-weight: bold; display: inline-block; width: 140px; }
        pre { padding: 10px; border-left: 4px solid #000; white-space: pre-wrap; }
        .section { margin-top: 20px; padding: 10px; }
        a { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>New Submission</h1>

        <div class="row"><span class="label">Submitted on:</span> {{submission_time}}</div>
        <div class="row"><span class="label">Full Name:</span> {{from_name}}</div>
        <div class="row"><span class="label">Email:</span> {{to_email}}</div>
        <div class="row"><span class="label">Phone:</span> {{phone_number}}</div>
        <div class="row"><span class="label">Category:</span> {{concern}}</div>

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
