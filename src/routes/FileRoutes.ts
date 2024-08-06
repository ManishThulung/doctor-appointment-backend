import { Router } from "express";
import path from "path";

const router = Router();

router.get("/file/:filename", (req, res) => {
  const { filename } = req.params;
  const dirname = path.resolve();
  const fullfilepath = path.join(dirname, "uploads/" + filename);
  return res.sendFile(fullfilepath);
});

export default router;
