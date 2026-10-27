import nodemailer from "nodemailer"

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  const info = await transporter.sendMail({
    from: `"Sarahaa App" <${process.env.EMAIL_USERNAME}>`,
    to,
    subject,
    html,
  })

  console.log(info.accepted)
}
