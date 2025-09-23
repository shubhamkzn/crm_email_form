export const ffm = {
  key: "ffm",
  name: "FFM PDF",
  preview: "Template for Fight For Mesothelioma form submissions.",
  html: `
    <!DOCTYPE html>
    <html>
    <head>
        <title>New PDF Form Submission</title>
        <style>
            body {
                font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
                line-height: 1.6;
                color: #2E2E2E;
                max-width: 650px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9fb;
            }
            .header {
                text-align: center;
                padding: 25px 0;
                background-color: #4B2C5E;
                color: #fff;
                border-radius: 8px 8px 0 0;
            }
            .header h1 {
                margin: 0;
                font-size: 22px;
                font-weight: 600;
            }
            .content {
                background-color: #ffffff;
                padding: 25px;
                border: 1px solid #e5e5e5;
                border-top: none;
                border-radius: 0 0 8px 8px;
            }
            .info-box {
                background-color: #fafafa;
                padding: 18px;
                border-radius: 6px;
                margin: 15px 0;
                border: 1px solid #eee;
            }
            .info-box h3 {
                margin-top: 0;
                font-size: 16px;
                color: #4B2C5E;
                border-bottom: 1px solid #ddd;
                padding-bottom: 8px;
            }
            .info-box p {
                margin: 6px 0;
                font-size: 14px;
            }
            .info-box strong {
                color: #333;
            }
            .footer {
                text-align: center;
                padding: 15px;
                font-size: 12px;
                color: #888;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>New PDF Form Submission</h1>
        </div>
        <div class="content">
            <div class="info-box">
                <h3>Contact Information:</h3>
                <p><strong>Name:</strong> {{user_name}}</p>
                <p><strong>Email:</strong> {{user_email}}</p>
                <p><strong>Phone:</strong> {{user_phone}}</p>
                <p><strong>Consent Given:</strong> {{consent_given}}</p>
            </div>
            <div class="info-box">
                <h3>Submission Details:</h3>
                <p><strong>Submission Time:</strong> {{submission_time}}</p>
                <p><strong>Form Type:</strong> {{form_type}}</p>
                <p><strong>Source URL:</strong> {{source_url}}</p>
            </div>
            <div class="info-box">
                <h3>TrustedForm Tracking:</h3>
                <p><strong>Certificate ID:</strong> {{certId}}</p>
                <p><strong>Ping URL:</strong> {{pingUrl}}</p>
                <p><strong>Token:</strong> {{tokenUrl}}</p>
            </div>
            <div class="info-box">
                <h3>Message:</h3>
                <p>{{message}}</p>
            </div>
        </div>
        <div class="footer">
            <p>This is an automated message from the <strong>Fight For Mesothelioma</strong> website.</p>
        </div>
    </body>
    </html>
  `,
  config: {},
};
