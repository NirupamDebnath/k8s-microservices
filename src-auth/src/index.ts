import express, { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import jwksRsa from "jwks-rsa";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import jose, { JWK } from "node-jose";

// Environment variables
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secure-secret";
const JWKS_URI = process.env.JWKS_URI || "http://localhost:3000/.well-known/jwks.json";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// JWKS Keystore
let keystore: JWK.KeyStore = jose.JWK.createKeyStore();

// Save keystore to disk
const saveKeystore = async (): Promise<void> => {
  fs.writeFileSync("keystore.json", JSON.stringify(keystore.toJSON(true)));
};

// Load keystore from disk
const loadKeystore = async (): Promise<void> => {
  if (fs.existsSync("keystore.json")) {
    const keystoreData = fs.readFileSync("keystore.json", "utf8");
    keystore = await jose.JWK.asKeyStore(keystoreData);
  } else {
    await keystore.generate("RSA", 2048, { alg: "RS256", use: "sig" });
    await saveKeystore();
  }
};

// Initialize Keystore
(async () => {
  await loadKeystore();
})();

// Generate JWT
app.post("/auth/token", async (req: Request, res: Response): Promise<void> => {
  const { username } = req.body;

  if (!username) {
    res.status(400).send({ error: "Username is required" });
    return;
  }

  // Get the signing key from the keystore
  const key = keystore.all({ use: "sig" })[0];

  // Check if the key exists
  if (!key) {
    res.status(500).send({ error: "No signing key available" });
    return;
  }

  // Export the private key in PEM format
  const privateKeyPem = key.toPEM(true);

  // Payload and options
  const payload = { username };
  const options : SignOptions = {
    algorithm: "RS256",
    keyid: key.kid,
    expiresIn: "1h",
  };

  // Sign the token
  try {
    const token = jwt.sign(payload, privateKeyPem, options);
    res.send({ token });
  } catch (error) {
    res.status(500).send({ error: "Error generating token", details: error });
  }
});


// Verify JWT using JWKS
app.post("/auth/verify", (req: Request, res: Response): void => {
  const { token } = req.body;

  if (!token) {
    res.status(400).send({ error: "Token is required" });
    return;
  }

  jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
    if (err) {
      res.status(401).send({ error: "Invalid token" });
      return;
    }

    res.send({ message: "Token is valid", decoded });
  });
});

// JWKS endpoint
app.get("/.well-known/jwks.json", (req: Request, res: Response): void => {
  res.json(keystore.toJSON());
});

// JWKS Key resolver
function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback): void {
  const client = jwksRsa({
    jwksUri: JWKS_URI,
  });

  client.getSigningKey(header.kid as string, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    // Ensure `key` and `getPublicKey` exist
    if (!key || typeof key.getPublicKey !== "function") {
      callback(new Error("Unable to retrieve public key"));
      return;
    }
    callback(null, key.getPublicKey());
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
