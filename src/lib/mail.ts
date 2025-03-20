import nodemailer from 'nodemailer';

interface SendMailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendMail({ to, subject, html }: SendMailOptions) {
    // SMTPトランスポータを作成
    // 開発環境では、nodemailerのエテリアルメール（テスト用のメールサービス）を使用
    // 本番環境では、環境変数から設定を読み込む
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
        secure: process.env.EMAIL_SERVER_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
        },
    });

    try {
        // メールを送信
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"Next.js App" <noreply@example.com>',
            to,
            subject,
            html,
        });

        console.log(`メール送信成功: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('メール送信エラー:', error instanceof Error ? error.message : '不明なエラー');
        return { success: false, error: error instanceof Error ? error.message : '不明なエラー' };
    }
}

// メール認証用のリンクを送信
export async function sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;

    return sendMail({
        to: email,
        subject: 'メールアドレスの確認',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">メールアドレスの確認</h2>
        <p>以下のリンクをクリックして、メールアドレスの確認を完了してください。</p>
        <a 
          href="${verificationUrl}" 
          style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;"
        >
          メールアドレスを確認する
        </a>
        <p>このリンクは24時間有効です。</p>
        <p>心当たりがない場合は、このメールを無視してください。</p>
      </div>
    `,
    });
} 