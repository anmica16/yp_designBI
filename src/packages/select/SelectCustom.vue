<template>
  <div
    class="el-select"
    :class="[selectSize ? 'el-select--' + selectSize : '']"
    @click.stop="toggleMenu"
    v-clickoutside="handleClose"
  >
    <div
      class="el-select__tags"
      v-if="multiple"
      ref="tags"
      :style="{ 'max-width': inputWidth - 32 + 'px', width: '100%' }"
    >
      <span v-if="collapseTags && selected.length">
        <el-tag
          :closable="!selectDisabled"
          :size="collapseTagSize"
          :hit="selected[0].hitState"
          type="info"
          @close="deleteTag($event, selected[0])"
          disable-transitions
        >
          <span class="el-select__tags-text">{{
            selected[0].currentLabel
          }}</span>
        </el-tag>
        <el-tag
          v-if="selected.length > 1"
          :closable="false"
          :size="collapseTagSize"
          type="info"
          disable-transitions
        >
          <span class="el-select__tags-text">+ {{ selected.length - 1 }}</span>
        </el-tag>
      </span>
      <transition-group @after-leave="resetInputHeight" v-if="!collapseTags">
        <el-tag
          v-for="item in selected"
          :key="getValueKey(item)"
          :closable="!selectDisabled"
          :size="collapseTagSize"
          :hit="item.hitState"
          type="info"
          @close="deleteTag($event, item)"
          disable-transitions
        >
          <span class="el-select__tags-text">{{ item.currentLabel }}</span>
        </el-tag>
      </transition-group>

      <input
        type="text"
        class="el-select__input"
        :class="[selectSize ? `is- ${selectSize}` : '']"
        :disabled="selectDisabled"
        :autocomplete="autoComplete || autocomplete"
        @focus="handleFocus"
        @blur="softFocus = false"
        @keyup="managePlaceholder"
        @keydown="resetInputState"
        @keydown.down.prevent="navigateOptions('next')"
        @keydown.up.prevent="navigateOptions('prev')"
        @keydown.enter.prevent="selectOption"
        @keydown.esc.stop.prevent="visible = false"
        @keydown.delete="deletePrevTag"
        @keydown.tab="visible = false"
        @compositionstart="handleComposition"
        @compositionupdate="handleComposition"
        @compositionend="handleComposition"
        v-model="query"
        @input="debouncedQueryChange"
        v-if="filterable"
        :style="{
          'flex-grow': '1',
          width: inputLength / (inputWidth - 32) + '%',
          'max-width': inputWidth - 42 + 'px'
        }"
        ref="input"
      />
    </div>
    <el-input
      ref="reference"
      v-model="selectedLabel"
      type="text"
      :placeholder="currentPlaceholder"
      :name="name"
      :id="id"
      :autocomplete="autoComplete || autocomplete"
      :size="selectSize"
      :disabled="selectDisabled"
      :readonly="readonly"
      :validate-event="false"
      :class="{ 'is-focus': visible }"
      :tabindex="multiple && filterable ? '-1' : null"
      @focus="handleFocus"
      @blur="handleBlur"
      @keyup.native="debouncedOnInputChange"
      @keydown.native.down.stop.prevent="navigateOptions('next')"
      @keydown.native.up.stop.prevent="navigateOptions('prev')"
      @keydown.native.enter.prevent="selectOption"
      @keydown.native.esc.stop.prevent="visible = false"
      @keydown.native.tab="visible = false"
      @paste.native="debouncedOnInputChange"
      @mouseenter.native="inputHovering = true"
      @mouseleave.native="inputHovering = false"
    >
      <template slot="prefix" v-if="$slots.prefix">
        <slot name="prefix"></slot>
      </template>
      <template slot="suffix">
        <i
          v-show="!showClose"
          :class="[
            'el-select__caret',
            'el-input__icon',
            'el-icon-' + iconClass
          ]"
        ></i>
        <i
          v-if="showClose"
          class="el-select__caret el-input__icon el-icon-circle-close"
          @click="handleClearClick"
        ></i>
      </template>
    </el-input>
    <transition
      name="el-zoom-in-top"
      @before-enter="handleMenuEnter"
      @after-leave="doDestroy"
    >
      <el-select-menu
        ref="popper"
        :append-to-body="popperAppendToBody"
        v-show="visible && emptyText !== false"
      >
        <el-scrollbar
          tag="ul"
          wrap-class="el-select-dropdown__wrap"
          view-class="el-select-dropdown__list"
          ref="scrollbar"
          :class="{
            'is-empty': !allowCreate && query && filteredOptionsCount === 0
          }"
          v-show="options.length > 0 && !loading"
        >
          <el-option :value="query" created v-if="showNewOption"></el-option>
          <slot></slot>
        </el-scrollbar>
        <template
          v-if="
            emptyText &&
              options.length === 0 &&
              (!allowCreate || loading || (allowCreate && options.length === 0))
          "
        >
          <slot name="empty" v-if="$slots.empty"></slot>
          <p class="el-select-dropdown__empty" v-else>{{ emptyText }}</p>
        </template>
      </el-select-menu>
    </transition>
  </div>
</template>

<script>
//【=1=】解决 select的 老是无匹配
import { Select } from "element-ui";
//【=2=】这种select不需要 blur的时候改变 input值
const visible = function(val) {
  if (!val) {
    this.broadcast("ElSelectDropdown", "destroyPopper");
    if (this.$refs.input) {
      this.$refs.input.blur();
    }
    //this.query = "";
    //this.previousQuery = null;
    //this.selectedLabel = "";
    //this.inputLength = 20;
    this.menuVisibleOnFocus = false;
    this.resetHoverIndex();
    this.$nextTick(() => {
      if (
        this.$refs.input &&
        this.$refs.input.value === "" &&
        this.selected.length === 0
      ) {
        this.currentPlaceholder = this.cachedPlaceHolder;
      }
    });
    if (!this.multiple) {
      if (this.selected) {
        if (
          this.filterable &&
          this.allowCreate &&
          this.createdSelected &&
          this.createdLabel
        ) {
          //this.selectedLabel = this.createdLabel;
        } else {
          //this.selectedLabel = this.selected.currentLabel;
        }
        if (this.filterable) this.query = this.selectedLabel;
      }

      if (this.filterable) {
        this.currentPlaceholder = this.cachedPlaceHolder;
      }
    }
  } else {
    this.broadcast("ElSelectDropdown", "updatePopper");
    if (this.filterable) {
      this.query = this.remote ? "" : this.selectedLabel;
      this.handleQueryChange(this.query);
      if (this.multiple) {
        this.$refs.input.focus();
      } else {
        if (!this.remote) {
          this.broadcast("ElOption", "queryChange", "");
          this.broadcast("ElOptionGroup", "queryChange");
        }

        if (this.selectedLabel) {
          this.currentPlaceholder = this.selectedLabel;
          this.selectedLabel = "";
        }
      }
    }
  }
  this.$emit("visible-change", val);
};
export default {
  extends: Select,
  computed: {
    showNewOption() {
      return false;
    }
  },
  methods: {
    setSelected() {
      if (!this.multiple) {
        let option = this.getOption(this.value);
        if (option.created) {
          this.createdLabel = option.currentLabel;
          this.createdSelected = true;
        } else {
          this.createdSelected = false;
        }
        //this.selectedLabel = option.currentLabel;
        this.selected = option;
        if (this.filterable) this.query = this.selectedLabel;
        return;
      }
      let result = [];
      if (Array.isArray(this.value)) {
        this.value.forEach(value => {
          result.push(this.getOption(value));
        });
      }
      this.selected = result;
      this.$nextTick(() => {
        this.resetInputHeight();
      });
    }
  },
  created() {
    let watchers = this._watchers.filter(w => {
      return w.expression == "visible";
    });
    watchers.forEach(w => {
      w.teardown();
    });
    this.$watch("visible", visible);
  }
};
</script>
