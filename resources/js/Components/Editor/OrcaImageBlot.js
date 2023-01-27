import Quill from 'quill';

let BlockEmbed = Quill.import('blots/block/embed');

class OrcaImageBlot extends BlockEmbed {
    static create(value) {
        let node = super.create();
        let img = document.createElement('img');

        node.setAttribute('contenteditable', false);
        node.dataset.layout = value.layout;

        img.setAttribute('alt', value.caption);
        img.setAttribute('src', value.url);
        node.appendChild(img);

        if (value.caption) {
            let caption = document.createElement('p');
            caption.innerHTML = value.caption;
            node.appendChild(caption);
        }

        return node;
    }

    static value(node) {
        let img = node.querySelector('img');

        return {
            layout: node.dataset.layout,
            caption: img.getAttribute('alt'),
            url: img.getAttribute('src')
        };
    }
}

OrcaImageBlot.tagName = 'div';
OrcaImageBlot.blotName = 'captioned-image';
OrcaImageBlot.className = 'embedded_image';

export default OrcaImageBlot;
