import React from "react"
import ReactMarkdown from "react-markdown"
function SummaryBox(summary) {
return(
    <div className="h-[60hv] overflow-auto">
        <ReactMarkdown className="text-base/8">{summary}</ReactMarkdown>
    </div>
)
}
export default SummeryBox