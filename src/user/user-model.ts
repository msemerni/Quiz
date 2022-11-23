const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
      login: String,
      password: String,
      nick: String,
    },
    { versionKey: false }
  );
  
  const User = mongoose.model("User", userSchema);

  export default User;
  