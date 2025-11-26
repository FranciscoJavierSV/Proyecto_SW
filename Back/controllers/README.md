CICLO DE VIDA DEL USUARIO:

1️. REGISTRO
   newUser → valida → hash contraseña → createUser → BD

2️. LOGIN (con protección bloqueo)
   login → findUser → verifica bloqueo
   ├─ Bloqueado → rechaza
   ├─ Contraseña incorrecta → incrementFailedAttempt → si ≥5 → lockUserUntil
   └─ Contraseña correcta → resetFailedAttempts → genera tokens

3️. RECUPERACIÓN
   recoveryUser → findEmail → jwt.sign (5min) → link → correo

4️. RESET CONTRASEÑA
   restore → jwt.verify → hash nueva → updatePassword

5️. EDITAR PREFERENCIAS
   editUser → según type → updateUserCountry/updateUserFontSize/updateUserContrast


---------------------------------------------------------------------------------------