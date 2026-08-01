export class XMLInterpreter {
    constructor() {}

    async interpretProjectPageXML(projectPageXMLFilePath) {
        try {
            const filepath = `../xml/${projectPageXMLFilePath}/project-page.xml`;
            // Fetch the XML file from the provided path
            const response = await fetch(filepath);
            const xmlString = await response.text();

            // Parse the XML string into an XML Document
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "text/xml");

            // Catch silent XML parsing errors
            const parseError = xmlDoc.querySelector("parsererror");
            if (parseError) {
                console.error("XML Parsing Error:", parseError.textContent);
                return `<div class="error">XML Format Error. Check console for details.</div>`;
            }

            // Get all stage elements
            const stages = xmlDoc.querySelectorAll("stage");
            let htmlOutput = "";

            // Loop through each stage and build the HTML
            stages.forEach((stage, index) => {
                if (stage.getAttribute("skip") === "true") {
                    return;
                }

                // Safely get the Stage Title
                const stageTitleNode = Array.from(stage.children).find(child => child.tagName === "title");
                const stageTitle = stageTitleNode ? stageTitleNode.textContent : "";

                let allSectionsHtml = "";

                // --- 1. Process the mandatory <section-description> block ---
                const sectionDescNode = stage.querySelector("section-description");
                if (sectionDescNode) {
                    const sdTitle = sectionDescNode.querySelector("title")?.textContent || "";
                    const sdDescNode = sectionDescNode.querySelector("description");

                    let sdDescHtml = "";
                    if (sdDescNode) {
                        sdDescHtml = `
                        <p style="margin-bottom: 0;">
                            ${sdDescNode.textContent.trim()}
                        </p>`;
                    }

                    allSectionsHtml += `
                    <div class="project-title-font bold">
                        ${sdTitle}
                    </div>
                    <div class="project-paragraph-font-size">
                        ${sdDescHtml}
                    </div>`;
                }

                // --- 2. Process the optional <section> blocks ---
                // We use Array.from and filter to only get direct <section> children,
                // preventing any future bugs if sections get nested.
                const sections = Array.from(stage.children).filter(child => child.tagName === "section");

                sections.forEach(section => {
                    const sectionTitle = section.querySelector("title")?.textContent || "";

                    // Handle optional description
                    const descriptionNode = section.querySelector("description");
                    let descriptionHtml = "";
                    if (descriptionNode) {
                        descriptionHtml = `
                        <p style="margin-bottom: 0;">
                            ${descriptionNode.textContent.trim()}
                        </p>`;
                    }

                    // Build list items for this specific section (now safely scoped inside <items>)
                    // We look for <item> elements inside the <items> wrapper
                    const items = section.querySelectorAll("items > item");
                    let itemsHtml = "";

                    items.forEach(item => {
                        // Updated to match the new <subsection-title> schema element
                        const subsectionTitleNode = item.querySelector("subsection-title");
                        const detailNode = item.querySelector("detail");

                        const subsectionTitle = subsectionTitleNode ? subsectionTitleNode.textContent.trim() : "";
                        const detail = detailNode ? detailNode.textContent.trim() : "";

                        // Only render the subsection title div if it actually exists in the XML
                        const titleHtml = subsectionTitle
                            ? `<div class="project-title-font bold">${subsectionTitle}</div>`
                            : "";

                        itemsHtml += `
                        ${titleHtml}
                        <ul style="margin:2px"><li>${detail}</li></ul>`;
                    });

                    // Append this section's HTML to the running list of sections for this stage
                    allSectionsHtml += `
                    <div class="project-title-font bold" style="margin-top: 15px;">
                        ${sectionTitle}
                    </div>
                    <div class="project-paragraph-font-size">
                        ${descriptionHtml}
                        ${itemsHtml}
                    </div>
                    `;
                });

                // Construct the full stage HTML
                htmlOutput += `
                <div class="stage-container">
                    <div class="project-stage project-title-font dropdown-hitbox">
                        <div class="stage-title">${stageTitle}</div>
                        <img src="../images/icons/down-arrow.svg" alt=" ∨ " class="stage-image">
                    </div>
                    <div class="stage-image-container stage-${index}"></div>
                    <div class="stage-description left-align-text">
                        <div class="text text-top project-title-font">
                            ${allSectionsHtml}
                            <div class="spacer"></div>
                        </div>
                    </div>
                </div>`;
            });

            return htmlOutput;

        } catch (error) {
            console.error("Error loading or parsing XML:", error);
            return `<div class="error">Unable to load project timeline.</div>`;
        }
    }
}