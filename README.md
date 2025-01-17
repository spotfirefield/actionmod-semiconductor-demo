# Semiconductor Action Mod for BigWafer dataset
The Semiconductor Action Mod is intended to demonstrate Spotfire's ability to enable an analyst to interact with semiconductor wafer maps and conduct bin analysis. It is designed to work with pre-created data in a particular format (detailed below) in order to show a demonstration of Spotfire in the high-tech manufacturing vertical, as well as to show off some Action Mod capabilities.

From a high level, the Action Mod uses APIs to perform the following tasks:
 - Applying a series of Data Table transformations using a reference copy of a particular Data Table, including Pivot, Unpivot, Add Calculated Column, Replace Values transformations and the Add Columns operation
 - Accessing and applying a color scheme, first from the local document, then from the Spotfire Library (if connected to a Spotfire Server)
 - Generating a new visualization with a specific configuration


Script|Purpose
---|---
`wafer-mapchart`|Creates a Map Chart visualization preconfigured with common settings for conducting wafer map bin analysis.
`wafer-transform`|Generates a series of transformations on a Data Table to prepare wafer data for Zone Profile analysis.
`create-linechart`|Creates a Line Chart visualization configured as a Zone Profiles analysis 


 ## Create wafer map chart
The `wafer-mapchart` action uses the a Data Table named `Big Wafer` to produce a Map Chart visualization for wafer bin analysis. The action attempts to apply a color scheme named `Bin Wafer Map Colors` first from the document; then if the color scheme is not found in the document, from the Spotfire Library at the path `/Bin Wafer Map Colors`; then if the color scheme is not found at that location, searching the Spotfire Library for a color scheme of the same name.

The action expects the following columns and data types to be present:
 - `[New Wafer]`, string
 - `[Die X]` and `[Die Y]`, numeric
 - `[Bin]`, any

The following properties will be set on the Map Chart:
 - Change title to "Wafer bin map"
 - Change coordinate reference system to "None"

A new Marker Layer named "die layer" will be created with the following properties:
 - Change coordinate reference system to "None"
 - X and Y axes set to `[Die X]` and `[Die Y]` respectively
 - Color axis set to the expression `<[Bin]>`
 - Apply the color scheme per the logic described above


## Wafermap data transform
The `wafer-transform` action requires a Data Table in the analysis with the following columns and data types:
 - `[New Wafer]`, string
 - `[Bin]`, numeric
 - `[Circle]`, any
 - `[Segment]`, any
 - `[Mask]`, any

The action then generates the following transformations:
 - Create new Calculated Columns named `[CirclePct]`, `[SegmentPct]`, and `[MaskPct]`
 - Pivot with identity columns `[New Wafer]`,`[Bin]`; titles `[Circle]`; value column `Avg([CirclePct])`; naming `%C.%V`
 - Unpivot with identity columns `[New Wafer]`,`[Bin]`; value columns from Pivot
 - Replace all `(Empty)` values with `0.0`
 - Insert new Calculated Columns `[Zone]`,`[Area]` with expression `Split([Category], '.', 1)` and `Split([Category], '.', 2)`
 - Pivot with identity columns `[New Wafer]`,`[Bin]`; column titles `[Zone]`,`[Area]`; value `[Value]`

 These transformations are applied to a copy of the targeted Data Table once for each of the columns `[Circle]/[CirclePct]`, `[Segment]/[SegmentPct]`, `[Mask]/[MaskPct]` with the resulting Data Tables joined together to produce the `Zone Profiles` Data Table.


## Create Zone Profile chart
The `create-linechart` action uses the Line Chart visualization to build a Zone Profiles chart using the Data Table created by the `wafer-transform` action. The following properties are set on the Line Chart:
 - Change title to "Zone Profiles"
 - Change X axis to `(Column Names)`
 - Change Y axis to `[CirclePct.Center], [CirclePct.Donut], [CirclePct.Edge], [SegmentPct.1], ...` (including remaining columns generated by the `wafer-transforms` action)
 - Apply a color scheme using the same logic as described in the `wafer-mapchart` action