import { Router } from "express";
import { HealthController } from "./health.controller.js";
import { healthService } from "./health.factory.js";

const router = Router();
const healthController = new HealthController(healthService);

router.get("/", healthController.getHealth);
router.get("/live", healthController.getLiveness);
router.get("/ready", healthController.getReadiness);

export { router as healthRoutes };
