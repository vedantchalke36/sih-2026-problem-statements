# SIH26175 - DepthWizard - Single-View Height Estimation and 3D Flythrough

## Metadata

- **S.No.:** 175
- **PS Number:** SIH26175
- **Title:** DepthWizard - Single-View Height Estimation and 3D Flythrough
- **Organization:** Indian Space Research Organisation(ISRO)
- **Department:** Department of Space / Indian Space Research Organisation
- **Category:** Software
- **Theme:** Disaster Management
- **Deadline for Idea Submission:** 30 September 2026
- **Submitted Ideas:** 0/500
- **Dataset Link:** [https://github.com/IMG-PROCESS-SAC/SIH2026/.](https://github.com/IMG-PROCESS-SAC/SIH2026/.)
- **Contact Info:** N/A
- **Youtube Link:** N/A

## Description

Background Accurate Digital Elevation Models (DEMs) and Digital Surface Models (DSMs) are fundamental to urban planning, disaster management, and military reconnaissance. Traditionally, elevation data is acquired through stereo-imaging pairs, LiDAR, or Interferometric Synthetic Aperture Radar (InSAR). These approaches can be cost-prohibitive, dependent on specific sensor availability, and computationally intensive. Single-view height estimation offers an agile alternative, but foundational monocular depth models are trained largely on natural egocentric imagery and predict relative depth. When applied to remote sensing, they face domain gaps, structural variations, and a lack of absolute-scale mapping. Converting relative depth into metric elevation remains a critical challenge, alongside the operational need to transform static elevation profiles into interactive 3D assets that can be navigated in real time.
Description Develop an end-to-end software pipeline that transforms single-view optical RGB remote-sensing images into high-precision elevation maps. The framework must support both non-georeferenced and georeferenced imagery.
• Non-Georeferenced RGB Imagery (for example, PNG or JPG): Produce a Relative Digital Surface Model (rDSM) for images without spatial metadata.
• Georeferenced RGB Imagery (for example, GeoTIFF): Produce an Absolute Digital Surface Model (DSM) with metric height values for images containing coordinate-system metadata.
The solution should use a pre-trained monocular depth-estimation backbone to generate initial relative-depth maps. For georeferenced imagery, a lower-resolution DEM source such as SRTM or a limited set of Ground Control Points may be used to map scale-agnostic depth features to absolute metric elevations. For non-georeferenced imagery, relative height may be used directly in the visualization stage.
After computing the elevation map, the system should project the original optical image onto a generated 3D terrain mesh and integrate the result with a rendering engine such as Unity, Three.js, or Babylon.js. The interface should support seamless first-person navigation and analysis of structural heights and slopes from arbitrary aerial perspectives.
Key Milestones
• Elevation Extraction: Use a robust pre-trained monocular depth model to extract geometric and structural representations from single-view optical imagery.
• Scale Calibration: Develop a module that converts relative depth to absolute height using scene-level statistics, low-resolution DEMs, semantic priors, or minimal Ground Control Points for georeferenced inputs.
• Visualization Layer: Build an immersive, preferably interactive, rendering pipeline that converts the optical texture and derived depth map into a navigable 3D environment deployable as a standalone application.
Evaluation Criteria:
• DSM Estimation - Accuracy and Validation (50%): Evaluate RMSE, MAE, and correlation against LiDAR or reference data, including performance stability across urban, sparse, hilly, and forested landscapes.
• Visualization - Rendering Quality and User Experience (50%): Assess projection accuracy, visual fidelity, navigability of the 3D flythrough, interface intuitiveness, software stability, and successful standalone deployment.
Expected Solution Deliver a fully integrated software suite with complete source code and technical documentation. The solution must be deployable as a unified module containing the following components:
• Elevation Estimation Module: Accept single-view optical satellite imagery in PNG, JPG, or TIFF format and output a high-fidelity DSM in a standard geospatial format.
• Interactive Visualization Platform: Provide a user-friendly 3D flythrough experience that lets users upload imagery, visualize reconstructed terrain, and validate estimated height values against reference datasets.

---
_Source: [sih.gov.in/sih2026PS](https://sih.gov.in/sih2026PS) | Scraped: 2026-09-03 | License: CC-BY-4.0_
