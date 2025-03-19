const nodemailer = require('nodemailer');

async function main() {
    // テスト用のエテリアルメールアカウントを作成
    const testAccount = await nodemailer.createTestAccount();

    console.log('エテリアルメールアカウントが作成されました:');
    console.log('===========================================');
    console.log(`EMAIL_SERVER_HOST=${testAccount.smtp.host}`);
    console.log(`EMAIL_SERVER_PORT=${testAccount.smtp.port}`);
    console.log(`EMAIL_SERVER_USER=${testAccount.user}`);
    console.log(`EMAIL_SERVER_PASSWORD=${testAccount.pass}`);
    console.log(`EMAIL_SERVER_SECURE=${testAccount.smtp.secure}`);
    console.log(`EMAIL_FROM="Next.js App <${testAccount.user}>"`)
    console.log('===========================================');
    console.log('受信メールを確認するURL: https://ethereal.email');
    console.log(`ユーザー名: ${testAccount.user}`);
    console.log(`パスワード: ${testAccount.pass}`);
}

main().catch(console.error); 