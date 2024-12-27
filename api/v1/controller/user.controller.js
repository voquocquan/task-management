const md5 = require("md5");
const User = require("../models/user.model");
const ForgotPassword = require("../models/forgot-password.model");

const generateHelper = require("../../../helpers/generate");
const sendMailHelper = require("../../../helpers/sendMail");
// [POST] /api/v1/users
module.exports.register = async (req, res) => {
  req.body.password = md5(req.body.password);

  const existEmail = await User.findOne({
    email: req.body.email,
    deleted: false
  });
  
  if(existEmail) {
    res.json({
      code: 400 ,
      message: "Email đã tồn tại!"
    })
    
  } else {
    const user = new User({
      fullName: req.body.fullName,
      email: req.body.email,
      password: req.body.password
    });

    user.save();

    const token = user.token;
    res.cookie("token", token);

    res.json({
      code: 200,
      message: "Tạo tài khoản thành công",
      token: token
    })
  }
};

// [POST] /api/v1/users/login
module.exports.login = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({
    email: email,
    deleted: false
  });

  if(!user) {
    res.json({
      code: 400,
      message: "Email không tồn tại!"
    });
    return;
  };

  if(md5(password) !== user.password) {
    res.json({
      code: 400,
      message: "Sai mật khẩu!"
    });
    return;
  };

  const token = user.token;
    res.cookie("token", token);

    res.json({
      code: 200,
      message: "Đăng nhập thành công",
      token: token
    })
};

// [POST] /api/v1/users/password/forgot
module.exports.forgotPassword = async (req, res) => {
  const email = req.body.email;

  const user = await User.findOne({
    email: email,
    deleted: false
  });

  if(!user) {
    res.json({
      code: 400,
      message: "Email không tồn tại!"
    });
    return;
  };

  const otp = generateHelper.generateRandomNumber(4);

  const timeExpire = 5;

  //Lưu data vào database
  const objectForgotPassword = {
    email: email,
    otp: otp,
    expireAt: Date.now() + timeExpire*60,
  };
  const forgotPassword = new ForgotPassword(objectForgotPassword);
  await forgotPassword.save();

  // Gửi OTP qua email user
  const subject = "Mã OTP xác minh lấy lại mật khẩu"
  const html = `Mã xác minh của bạn là <b>${otp}</b>. Sử dụng trong ${timeExpire} phút.
    Vui lòng không cung cấp hoặc chia sẻ cho người khác. `

  sendMailHelper.sendMail(email, subject, html); 
  
  res.json({
    code: 200,
    message: "Đã gửi OTP qua email!"
  });
};

// [POST] /api/v1/users/password/otp
module.exports.otpPassword = async (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;

  const result = await ForgotPassword.findOne({
    email: email,
    otp: otp
  });

  if(!result) {
    res.json({
      code: 400,
      message: "OTP không hợp lệ!"
    });
    return;
  }
  const user = await User.findOne({
    email: email
  })
  const token = user.token;
  res.cookie("token", token)

  res.json({
    code: 200,
    message: "Xác thực thành công",
    token: token
  })
};

// [POST] /api/v1/users/password/reset
module.exports.resetPassword = async (req, res) => {
  const token = req.body.token;
  const password = req.body.password;

  const user = await User.findOne({
    token: token
  });

  if(md5(password) === user.password) {
    res.json({
      code: 400,
      message: "Vui lòng nhập mật khẩu mới khác mật khẩu cũ!"
    });
    return;
  };

  await User.updateOne(
    {
      token: token
    }, 
    {
      password: md5(password)
    }
  );

  res.json({
    code: 200,
    message: "Đổi mật khẩu thành công!"
  })
  
};

// [GET] /api/v1/users/detail
module.exports.detail = async (req, res) => {
  const token = req.cookies.token;

  const user = await User.findOne({
    token: token,
    deleted: false
  }).select(" -password -token");

  res.json({
    code: 200,
    message: "Thành công",
    info: user
  });
};

