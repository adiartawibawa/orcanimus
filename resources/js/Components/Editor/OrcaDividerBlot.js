import Quill from "quill";

let BlockEmbed = Quill.import("blots/block/embed");

class OrcaDividerBlot extends BlockEmbed {}

OrcaDividerBlot.blotName = "divider";
OrcaDividerBlot.tagName = "hr";

export default OrcaDividerBlot;
