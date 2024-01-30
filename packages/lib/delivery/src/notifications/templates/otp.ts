export const OTP_EMAIL_TEMPLATE = (
    otp: string,
    date: string,
    expiryDuration: number,
) =>
    `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <title>Static Template</title>
    
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style="
          margin: 0;
          font-family: 'Poppins', sans-serif;
          background: #ffffff;
          font-size: 14px;
        "
      >
        <div
          style="
            max-width: 680px;
            margin: 0 auto;
            padding: 45px 30px 60px;
            background: #f4f7ff;
            background-image: url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQl6vHA09jzA4k2lrbtXht9smzhJvwi3sCddg&usqp=CAU);
            background-repeat: no-repeat;
            background-size: 100% 100%;
            background-position: top center;
            font-size: 14px;
            color: #434343;
          "
        >
          <header>
            <table style="width: 100%;">
              <tbody>
                <tr style="height: 0;">
                  <td>
                    <img
                      alt=""
                      src="https://user-images.githubusercontent.com/26625404/268010477-81f519df-e0aa-4a2e-b5ff-debcb4fcafa4.png"
                      height="30px"
                    />
                  </td>
                  <td style="text-align: right;">
                    <span
                      style="font-size: 16px; line-height: 30px; color: #ffffff;"
                      >${date}</span
                    >
                  </td>
                </tr>
              </tbody>
            </table>
          </header>
    
          <main>
            <div
              style="
                margin: 0;
                margin-top: 40px;
                padding: 92px 30px 80px;
                background: #ffffff;
                border-radius: 30px;
                text-align: center;
              "
            >
              <div style="width: 100%; max-width: 489px; margin: 0 auto;">
                <h1
                  style="
                    margin: 0;
                    font-size: 24px;
                    font-weight: 500;
                    color: #1f1f1f;
                  "
                >
                  Your OTP
                </h1>
                <p
                  style="
                    margin: 0;
                    margin-top: 17px;
                    font-size: 16px;
                    font-weight: 500;
                  "
                >
                  Hey User,
                </p>
                <p
                  style="
                    margin: 0;
                    margin-top: 17px;
                    font-weight: 500;
                    letter-spacing: 0.56px;
                  "
                >
                  Thank you for choosing DM3 Company. Use the following OTP
                  to verify your email address. OTP is
                  valid for
                  <span style="font-weight: 600; color: #1f1f1f;">${expiryDuration} minutes</span>.
                  Do not share this code with others.
                </p>
                <p
                  style="
                    margin: 0;
                    margin-top: 40px;
                    font-size: 40px;
                    font-weight: 600;
                    letter-spacing: 25px;
                    color: #ba3d4f;
                  "
                >
                  ${otp}
                </p>
              </div>
            </div>
    
            <p
              style="
                max-width: 400px;
                margin: 0 auto;
                margin-top: 50px;
                text-align: center;
                font-weight: 500;
                color: #ffffff;
              "
            >
              Need help? Ask at
              <a
                href="mailto:decentralized.messaging@gmail.com"
                style="color: #499fb6;"
                >decentralized.messaging@gmail.com</a
              >
            </p>
          </main>
    
          <footer
            style="
              width: 100%;
              max-width: 490px;
              margin: 20px auto 0;
              text-align: center;
              border-top: 1px solid #e6ebf1;
            "
          >
            <p
              style="
                margin: 0;
                margin-top: 40px;
                font-size: 16px;
                font-weight: 600;
                color: #ffffff;
              "
            >
              DM3 Company
            </p>
            <p style="margin: 0; margin-top: 16px; color: #ffffff;">
              Copyright © 2024 Company. All rights reserved.
            </p>
          </footer>
        </div>
      </body>
    </html>
    `;

export const OTP_EMAIL_SUBJECT = 'Email Verification';
