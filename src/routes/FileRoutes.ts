import { Router } from "express";
import path from "path";

const router = Router();

router.get("/file/:filename", (req, res) => {
  const { filename } = req.params;
  const dirname = path.resolve();
  const fullfilepath = path.join(dirname, "uploads/" + filename);
  return res.sendFile(fullfilepath);
});

router.get("/pdf/:filename", (req, res) => {
  const { filename } = req.params;
  const dirname = path.resolve();
  const fullfilepath = path.join(dirname, "uploads/" + filename);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'inline; filename="' + filename + '"');
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  // Send the file with the appropriate headers
  res.sendFile(fullfilepath, (err) => {
    if (err) {
      // Handle error if the file is not found or another issue occurs
      res.status(404).send("File not found.");
    }
  });
});

export default router;
