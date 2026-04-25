import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL ?? ''

function buildEmailHtml(itemName: string, reservedBy: string, message?: string, quantity?: number, totalQuantity?: number): string {
  const showQty = totalQuantity && totalQuantity > 1
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nouvelle réservation</title>
</head>
<body style="margin:0;padding:0;background-color:#fdf8f3;font-family:Georgia,serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fdf8f3;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <p style="margin:0;font-family:Georgia,serif;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#c4968f;">
                Liste de naissance
              </p>
              <h1 style="margin:10px 0 0;font-family:Georgia,serif;font-size:26px;font-weight:700;color:#5c3d28;letter-spacing:-0.01em;line-height:1.2;">
                Géraldine &amp; Jonathan
              </h1>
              <!-- Séparateur décoratif -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin:16px auto 0;">
                <tr>
                  <td style="width:32px;height:1px;background-color:#e8ddd0;"></td>
                  <td style="padding:0 10px;font-size:14px;color:#c4968f;">✦</td>
                  <td style="width:32px;height:1px;background-color:#e8ddd0;"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card principale -->
          <tr>
            <td style="background-color:#ffffff;border-radius:14px;border:1px solid #e8ddd0;padding:36px 36px 32px;">

              <!-- Icône -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <div style="display:inline-block;width:56px;height:56px;border-radius:50%;background-color:#f0e4e0;text-align:center;line-height:56px;font-size:26px;">
                      🎁
                    </div>
                  </td>
                </tr>

                <!-- Titre -->
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <h2 style="margin:0;font-family:Georgia,serif;font-size:20px;font-weight:700;color:#5c3d28;letter-spacing:-0.01em;">
                      Nouvelle réservation !
                    </h2>
                  </td>
                </tr>

                <!-- Texte intro -->
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <p style="margin:0;font-size:15px;color:#8a6550;line-height:1.7;text-align:center;">
                      <strong style="color:#3d2b1f;">${reservedBy}</strong> vient de réserver<br />
                      un article sur votre liste.
                    </p>
                  </td>
                </tr>

                <!-- Article réservé -->
                <tr>
                  <td style="padding-bottom:${message ? '20px' : '0'};">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                      style="background-color:#fdf8f3;border-radius:10px;border:1px solid #e8ddd0;">
                      <tr>
                        <td style="padding:18px 20px;">
                          <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#c4968f;">
                            Article réservé
                          </p>
                          <p style="margin:0;font-family:Georgia,serif;font-size:17px;font-weight:700;color:#5c3d28;line-height:1.3;">
                            ${itemName}
                          </p>
                          <p style="margin:6px 0 0;font-size:13px;color:#c4968f;">
                            réservé par <strong style="color:#8a6550;">${reservedBy}</strong>${showQty ? ` &nbsp;·&nbsp; <strong style="color:#7a9e87;">${quantity} / ${totalQuantity}</strong>` : ''}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                ${message ? `
                <!-- Message personnel -->
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                      style="background-color:#f0e4e0;border-radius:10px;border-left:3px solid #c4968f;">
                      <tr>
                        <td style="padding:16px 20px;">
                          <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#c4968f;">
                            Message
                          </p>
                          <p style="margin:0;font-family:Georgia,serif;font-size:15px;font-style:italic;color:#5c3d28;line-height:1.6;">
                            &laquo;&nbsp;${message}&nbsp;&raquo;
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ''}
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;padding-bottom:8px;">
              <p style="margin:0;font-size:12px;color:#c8bdb5;letter-spacing:0.06em;">
                Géraldine &amp; Jonathan · Liste de naissance
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
}

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY || !NOTIFY_EMAIL) {
    return NextResponse.json({ ok: true }) // silencieux si non configuré
  }

  let body: { itemName: string; reservedBy: string; quantity?: number; totalQuantity?: number; message?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  const { itemName, reservedBy, quantity, totalQuantity, message } = body

  try {
    await resend.emails.send({
      from: 'Liste de naissance <onboarding@resend.dev>',
      to: [NOTIFY_EMAIL, 'geraldinesika@gmail.com'].filter(Boolean),
      subject: quantity && quantity > 1 ? `🎁 ${reservedBy} a réservé ${quantity}× "${itemName}"` : `🎁 ${reservedBy} a réservé "${itemName}"`,
      html: buildEmailHtml(itemName, reservedBy, message, quantity, totalQuantity),
    })
  } catch (err) {
    console.error('Resend error:', err)
  }

  return NextResponse.json({ ok: true })
}
