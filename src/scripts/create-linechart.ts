import { getColorSchemeFromDocument, getColorSchemeFromLibrary } from "../utils/library";
import { getOrCreateMarking } from "../utils/data";

const { LineChart, LabelOrientation, CategoryKey } = Spotfire.Dxp.Application.Visuals;


const MARKING_NAME = "Marking";
const CHART_TITLE = "Zone Profiles";
const XAXIS_EXPRESSION = "<[Axis.Default.Names]>";
const XAXIS_SCALE_ORIENTATION = LabelOrientation.Vertical;
const YAXIS_EXPRESSION = "[CirclePct.Center], [CirclePct.Donut], [CirclePct.Edge], [SegmentPct.1],[SegmentPct.2],[SegmentPct.3],[SegmentPct.4],[SegmentPct.5],[SegmentPct.6], [MaskPct.1],  [MaskPct.2], [MaskPct.3], [MaskPct.4], [MaskPct.5], [MaskPct.6], [MaskPct.7], [MaskPct.8], [MaskPct.9]";
const LINEBYAXIS_EXPRESSION = "<[New Wafer]>";
const COLORAXIS_EXPRESSION = "<Bin>";
const LIMITBY_EXPRESSION = "[Bin] >= 2";  // AKA WhereClauseExpression
const COLORSCHEME_NAME = "Big Wafer";


export function createLinechart({ document, application }: CreateLinechartParameters) {
    
    // get the current page, or create a new one if one doesn't exist
    const page = document.ActivePageReference ?? document.Pages.AddNew();
    // get the current data table, or the first one added to the document if one is not active
    const dataTable = document.ActiveDataTableReference ?? Array.from(document.Data.Tables)[0];
    
    // create a new LineChart
    const lineChart = page.Visuals.AddNew(LineChart);

    lineChart.Title = CHART_TITLE;

    lineChart.Data.DataTableReference = dataTable;
    lineChart.Data.MarkingReference = getOrCreateMarking(document, MARKING_NAME);
    
    lineChart.Data.WhereClauseExpression = LIMITBY_EXPRESSION;
    
    lineChart.XAxis.Expression = XAXIS_EXPRESSION;
    lineChart.XAxis.Scale.LabelOrientation = XAXIS_SCALE_ORIENTATION;
    lineChart.YAxis.Expression = YAXIS_EXPRESSION;
    
    lineChart.LineByAxis.Expression = LINEBYAXIS_EXPRESSION;
    
    // set the color axis and set first Bin color to a light gray
    // (keeping this as a fallback in case the color scheme is unavailable)
    lineChart.ColorAxis.Expression = COLORAXIS_EXPRESSION;
    const lightGray = System.Drawing.Color.FromArgb(255, 241, 241, 241);
    lineChart.ColorAxis.Coloring.SetColorForCategory(new CategoryKey(1), lightGray);

    // attempt to apply color scheme
    try {
        const documentColorScheme = getColorSchemeFromDocument(document, COLORSCHEME_NAME);
        lineChart.ColorAxis.Coloring.Apply(documentColorScheme.DisplayName);

    } catch (noDocumentColorSchemeError) {
        // scheme not found in the document; look in the library instead
        try {
            const libraryColorScheme = getColorSchemeFromLibrary(application, `/${COLORSCHEME_NAME}`);
            const documentColorScheme = document.ColoringTemplates.AddFromLibrary(libraryColorScheme);
            lineChart.ColorAxis.Coloring.Apply(documentColorScheme.DisplayName);
        } catch (libraryAccessError) {
            // probably the user is not connected to a server, or the library path is invalid
            // do nothing, the user will have to set the color scheme manually
        }
    }
}

RegisterEntryPoint(createLinechart);
