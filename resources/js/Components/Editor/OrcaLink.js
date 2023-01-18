import Quill from "quill";
import DOMPurify from "dompurify";

const Link = Quill.import("formats/link");

class OrcaLink extends Link {
    static create(value) {
        let node = super.create(value);

        value = this.sanitize(value);

        node.setAttribute("href", value);

        node.removeAttribute("target");

        return node;
    }

    format(name, value) {
        super.format(name, value);
        this["domNode"].removeAttribute("target");
    }
}

export default OrcaLink;
