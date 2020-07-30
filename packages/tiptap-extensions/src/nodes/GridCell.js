import { Node } from 'tiptap'
import { toggleWrap } from 'tiptap-commands'

export default class GridCell extends Node {

  get name() {
    return 'grid_cell'
  }

  get defaultOptions() {
    return {
      prefix: 'column',
      columns: {
        default: 12,
        phone: 0,
        tablet: 0,
      },
    }
  }

  _parseClass(dom) {
    const [...classList] = dom.classList
    return classList.map(cls => cls.split('-')).reduce((acc, [, range, value]) => ({
      [range]: Number(value),
      ...acc,
    }), this.options.columns)
  }

  _renderClass(cols) {
    return Object.entries(cols)
        .filter(([, value]) => value !== 0)
        .map(([key, value]) => `${this.options.prefix}-${key}-${value}`)
  }

  get view() {
    const that = this
    return {
      props: ['node', 'updateAttrs', 'view'],
      data() {
        return {
          cols: { ...this.node.attrs.cols },
        }
      },
      computed: {
        classList() {
          return that._renderClass(this.cols).join(' ')
        },
      },
      watch: {
        cols: {
          deep: true,
          handler(oldVal, newVal) {
            this.updateAttrs({
              cols: newVal,
            })
          },
        },
      },
      template: `
        <div class="grid_cell_wrapper" :class="classList">
          <input v-for="key in Object.keys(cols)" class="grid_cell__input" @paste.stop @keydown.stop type="text" v-model.number="cols[key]" v-if="view.editable" />
          <div class="grid_cell" ref="content" :contenteditable="view.editable.toString()"></div>
        </div>
      `,
    }
  }

  commands({ type, schema }) {
    return () => toggleWrap(type, schema.nodes.grid_cell)
  }

  get schema() {
    return {
      attrs: {
        cols: {
          default: {
            ...this.options.columns,
          },
        },
      },
      draggable: true,
      group: 'block',
      content: 'block+',
      defining: true,
      toDOM: node => {
        const { cols } = node.attrs
        return [
          'div',
          {
            'data-type': this.name,
            class: this._renderClass(cols),
          },
          0,
        ]
      },
      parseDOM: [{
        tag: `div[data-type="${this.name}"]`,
        getAttrs: dom => ({
          cols: this._parseClass(dom),
        }),
      }],
    }
  }

}
