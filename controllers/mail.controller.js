const nodemailer = require('nodemailer');
const uploadBucket = require('../utils/uploadBucket');

exports.sendMail = async (req, res, next) => {

  let { text, mailto, subject, user, url, attachment } = req.body;

  user = JSON.parse(user);

  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'jvinicius.pereira.moreira@gmail.com',
      pass: 'vbn20077'
    }
  });


  await transporter.sendMail({
    from: 'jvinicius.pereira.moreira@gmail.com',
    to: mailto,
    subject,
    text,
    attachments: [attachment && attachment.path ? attachment : {}],
    html: `
    <table width="720">
    <thead>
        <tr>
            <td colspan="12" style="text-align: center; border-bottom: 1px solid #3C625E; padding-bottom: 15px">
                <a href="https://bancoarbi.com.br" target="_blank">
                    <img src="https://i.imgur.com/aMpZESS.png" alt="Banco Arbi" />
                </a>
            </td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="text-align:center; padding-top:15px;">
                <h2 style="font-family:sans-serif; margin: 0;">Você recebeu um
                 convite do usuário ${user.nome}
                </h2>
                  <p style="font-family:sans-serif; color:#999;
                  line-height: 24px; padding-top: 15px; text-align: justify;">${text}</p>
                  <h5 style="font-family:sans-serif; margin: 10px 0 0;">Clique no botão abaixo para preencher o seu
                      cadastro</h5>
            </td>
        </tr>
        <tr>
            <td colspan="12" align="center" style="padding-top:80px; padding-bottom: 100px;">
                <a href="${url}" target="_blank" style="font-family:sans-serif; background:#3C625E; color:#fff;
                border-radius:30px; text-align:center; width: 230px; display: inline-block;
                padding: 15px 0 17px; text-decoration: none;">Aceitar
                    convite</a>
            </td>
        </tr>
    </tbody>
    <tfoot>
        <tr>
            <td colspan="12" bgcolor="#3C625E" style="padding: 15px; color: #fff; text-align: center;">
                <p style="font-family:sans-serif; font-size: 12px;">Avenida Niemeyer, 02 - térreo - parte -
                    Leblon - Rio de Janeiro - RJ - CEP: 22.450-220</p>
                <p style="font-family:sans-serif; font-size: 12px; color: rgba(255,255,255,0.5)">(21) 2529-1800
                    - (21) 2199-1800 - (71) 3272-4008</p>
            </td>
        </tr>
    </tfoot>
</table>
    `
  }).then(response => {
    // console.log('------MAIL-------');
    // console.log(attachment)
    // console.log('------MAIL-------');
    res.status(200).send({ status: 200 })
  })
    .catch(error => {
      res.status(400).send({ status: 400, error })
    })

}

exports.upload = async (req, res, next) => {
  req.assert('file', 'Arquivo é um campo obrigatório');
  let { id } = req.body;
  let { file } = req;
  let data = {
    file: file,
    id: id
  };
  uploadBucket.upload(data)
    .then((dataFile) => {
      // console.log('------FILE-------');
      // console.log(dataFile[0])
      // console.log('------FILE-------');
      res.status(200).send({
        status: 200, file: {
          name: file.originalname,
          url: dataFile[0]
        }
      })
    })
}