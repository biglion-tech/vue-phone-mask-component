<template>
    <div class="phone-mask">
        <input
                type="text"
                ref="phoneField"
                @keydown="masksKeyDown"
                @keypress="masksKeyPress"
                @paste="masksPaste"
                @cut="masksPaste">
        <p>Регион: {{ hint }}</p>
    </div>
</template>

<script>
    import inputmask from "inputmask";

    export default {
        name: "PhoneMask",
        mounted() {
            this.maskStart(this.maskOpts);
        },
        computed: {
            maskOpts() {
                let self = this;
                return {
                    inputmask: {
                        definitions: {
                            "#": {
                                validator: "[0-9]",
                                cardinality: 1
                            }
                        },
                        showMaskOnHover: false,
                        autoUnmask: true
                    },
                    match: /[0-9]/,
                    replace: "9",
                    list: this.maskList,
                    listKey: "mask",
                    onMaskChange(maskObj, completed) {
                        if (completed) {
                            var hint = maskObj.name_ru;
                            if (maskObj.desc_ru && maskObj.desc_ru != "") {
                                hint += " (" + maskObj.desc_ru + ")";
                            }
                            self.hint = hint;
                        } else {
                            self.hint = hint;
                        }
                        self.$refs.phoneField.setAttribute("placeholder", "+_(___)___-____");
                    }
                };
            }
        },

        methods: {
            maskStart(maskOpts) {
                var defs = {};
                for (var def in maskOpts.inputmask.definitions) {
                    var validator = maskOpts.inputmask.definitions[def].validator;
                    switch (typeof validator) {
                        case "string":
                            defs[def] = new RegExp(validator);
                            break;
                        case "object":
                            if ("test" in maskOpts.definitions[def].validator) {
                                defs[def] = validator;
                            }
                            break;
                        case "function":
                            defs[def] = {
                                test: validator
                            };
                            break;
                    }
                }
                maskOpts.inputmask.definitions[maskOpts.replace] = {
                    validator: maskOpts.match.source,
                    cardinality: 1
                };

                if (this.$refs.phoneField.inputmasks) {
                    inputmask.remove(this.$refs.phoneField);
                }

                this.$refs.phoneField.inputmasks = {};
                this.$refs.phoneField.inputmasks.options = maskOpts;
                this.$refs.phoneField.inputmasks.defs = defs;
                this.$refs.phoneField.inputmasks.iphone =
                    navigator.userAgent.match(/iphone/i) != null;
                this.$refs.phoneField.inputmasks.oldmatch = false;
                this.$refs.phoneField.inputmasks.placeholder =
                    maskOpts.inputmask.placeholder ||
                    inputmask.prototype.defaults.placeholder;
                this.$refs.phoneField.inputmasks.insertMode =
                    maskOpts.inputmask.insertMode !== undefined
                        ? maskOpts.inputmask.insertMode
                        : inputmask.prototype.defaults.insertMode;

                this.maskInit();
            },

            maskInit(text) {
                if (text === undefined) {
                    if (
                        this.$refs.phoneField.inputmask &&
                        this.$refs.phoneField.inputmask._valueGet
                    ) {
                        text = this.$refs.phoneField.inputmask._valueGet();
                    } else {
                        text = this.$refs.phoneField.value;
                    }
                }
                var match = this.maskMatch(text);
                while (!match && text.length > 0) {
                    text = text.substr(0, text.length - 1);
                    match = this.maskMatch(text);
                }
                this.maskApply(match, text);
            },

            maskMatch(text) {
                var maskOpts = this.$refs.phoneField.inputmasks.options;
                var mtxt = "";
                for (var i = 0; i < text.length; i++) {
                    var ch = text.charAt(i);
                    if (ch == this.$refs.phoneField.inputmasks.placeholder) {
                        break;
                    }
                    if (maskOpts.match.test(ch)) {
                        mtxt += ch;
                    }
                }
                for (var mid in maskOpts.list) {
                    var mask = maskOpts.list[mid][maskOpts.listKey];
                    var pass = true;
                    for (var it = 0, im = 0; it < mtxt.length && im < mask.length;) {
                        var chm = mask.charAt(im);
                        var cht = mtxt.charAt(it);
                        if (
                            !maskOpts.match.test(chm) &&
                            !(chm in this.$refs.phoneField.inputmasks.defs)
                        ) {
                            im++;
                            continue;
                        }
                        if (
                            (chm in this.$refs.phoneField.inputmasks.defs &&
                                this.$refs.phoneField.inputmasks.defs[chm].test(cht)) ||
                            cht == chm
                        ) {
                            it++;
                            im++;
                        } else {
                            pass = false;
                            break;
                        }
                    }
                    if (pass && it == mtxt.length) {
                        var determined = mask.substr(im).search(maskOpts.match) == -1;
                        mask = mask.replace(
                            new RegExp(
                                [maskOpts.match.source]
                                    .concat(Object.keys(this.$refs.phoneField.inputmasks.defs))
                                    .join("|"),
                                "g"
                            ),
                            maskOpts.replace
                        );
                        var completed = mask.substr(im).search(maskOpts.replace) == -1;
                        return {
                            mask: mask,
                            obj: maskOpts.list[mid],
                            determined: determined,
                            completed: completed
                        };
                    }
                }
                return false;
            },

            maskApply(match, newtext) {
                var maskOpts = this.$refs.phoneField.inputmasks.options;
                if (
                    match &&
                    (newtext !== undefined ||
                        match.mask != this.$refs.phoneField.inputmasks.oldmatch.mask)
                ) {
                    var caretPos;
                    if (newtext === undefined) {
                        caretPos = this.caretApply(
                            this.$refs.phoneField.inputmasks.oldmatch.mask,
                            match.mask,
                            this.caret()
                        );
                    } else {
                        if (this.$refs.phoneField.inputmask) {
                            inputmask.remove(this.$refs.phoneField);
                        }
                        this.$refs.phoneField.value = newtext;
                    }
                    inputmask(match.mask, maskOpts).mask(this.$refs.phoneField);
                    if (newtext === undefined) {
                        this.caret(caretPos.begin, caretPos.end);
                    }
                }
                this.$refs.phoneField.inputmasks.oldmatch = match;
                maskOpts.onMaskChange(match.obj, match.determined);
            },

            caret(begin, end) {
                let range;

                if (typeof begin == "number") {
                    end = typeof end == "number" ? end : begin;
                    if (this.$refs.phoneField.setSelectionRange) {
                        this.$refs.phoneField.setSelectionRange(begin, end);
                    } else if (this.$refs.phoneField.createTextRange) {
                        range = this.$refs.phoneField.createTextRange();
                        range.collapse(true);
                        range.moveEnd("character", end);
                        range.moveStart("character", begin);
                        range.select();
                    }
                } else {
                    if (this.$refs.phoneField.setSelectionRange) {
                        begin = this.$refs.phoneField.selectionStart;
                        end = this.$refs.phoneField.selectionEnd;
                    } else if (document.selection && document.selection.createRange) {
                        range = document.selection.createRange();
                        begin = 0 - range.duplicate().moveStart("character", -100000);
                        end = begin + range.text.length;
                    }
                    return {
                        begin: begin,
                        end: end
                    };
                }
            },

            caretApply(oldMask, newMask, oldPos) {
                var maskOpts = this.$refs.phoneField.inputmasks.options;
                if (!oldMask) {
                    return 0;
                }
                var pos = 0,
                    startPos = 0;
                for (; pos < oldPos.begin; pos++) {
                    if (oldMask.charAt(pos) == maskOpts.replace) {
                        startPos++;
                    }
                }
                var endPos = 0;
                for (; pos < oldPos.end; pos++) {
                    if (oldMask.charAt(pos) == maskOpts.replace) {
                        endPos++;
                    }
                }
                for (
                    pos = 0;
                    pos < newMask.length &&
                    (startPos > 0 || newMask.charAt(pos) != maskOpts.replace);
                    pos++
                ) {
                    if (newMask.charAt(pos) == maskOpts.replace) {
                        startPos--;
                    }
                }
                startPos = pos;
                for (; pos < newMask.length && endPos > 0; pos++) {
                    if (newMask.charAt(pos) == maskOpts.replace) {
                        endPos--;
                    }
                }
                endPos = pos;
                return {
                    begin: startPos,
                    end: endPos
                };
            },

            masksKeyDown(e) {
                if (e.metaKey) {
                    this.runOriginal(e);
                    return true;
                }
                var maskOpts = this.$refs.phoneField.inputmasks.options;
                e = e || window.event;
                var k = e.which || e.charCode || e.keyCode;
                if (
                    k == 8 ||
                    k == 46 ||
                    (this.$refs.phoneField.inputmasks.iphone && k == 127)
                ) {
                    // delete or backspace
                    var text = this.$refs.phoneField.inputmask._valueGet();
                    var caretPos = this.caret();
                    if (caretPos.begin == caretPos.end) {
                        var pos = caretPos.begin;
                        do {
                            if (k != 46) {
                                // backspace
                                pos--;
                            }
                            var chr = text.charAt(pos);
                            text = text.substring(0, pos) + text.substring(pos + 1);
                        } while (
                            pos > 0 &&
                            pos < text.length &&
                            chr != this.$refs.phoneField.inputmasks.placeholder &&
                            !maskOpts.match.test(chr)
                            );
                    } else {
                        text =
                            text.substring(0, caretPos.begin) + text.substring(caretPos.end);
                    }
                    return this.keyboardApply(e, text, false);
                }
                if (k == 45) {
                    // insert
                    this.$refs.phoneField.inputmasks.insertMode = !this.$refs.phoneField
                        .inputmasks.insertMode;
                }
                this.runOriginal(e);
                return true;
            },

            keyboardApply(e, text, insert) {
                var match = this.maskMatch(text);
                if (
                    !match ||
                    match.obj != this.$refs.phoneField.inputmasks.oldmatch.obj ||
                    match.determined != this.$refs.phoneField.inputmasks.oldmatch.determined
                ) {
                    if (match) {
                        if (insert) {
                            this.maskApply(match);
                            this.runOriginal(e);
                        } else {
                            this.runOriginal(e);
                            this.maskApply(match);
                        }
                    } else {
                        if (!insert || !this.$refs.phoneField.inputmasks.insertMode) {
                            this.maskInit(text);
                        }
                    }
                    return false;
                }
                this.runOriginal(e);
                return true;
            },

            runOriginal(e) {
                this.$refs.phoneField.inputmask.events[e.type][0](e);
            },

            masksKeyPress(e) {
                if (e.metaKey) {
                    this.runOriginal(e);
                    return true;
                }
                var text = this.$refs.phoneField.inputmask._valueGet();
                e = e || window.event;
                var k = e.which || e.charCode || e.keyCode,
                    c = String.fromCharCode(k);
                var caretPos = this.caret();
                if (
                    caretPos.begin == caretPos.end &&
                    text.charAt(caretPos.begin) ==
                    this.$refs.phoneField.inputmasks.placeholder
                ) {
                    text =
                        text.substring(0, caretPos.begin) +
                        c +
                        text.substring(caretPos.end + 1);
                } else {
                    text =
                        text.substring(0, caretPos.begin) + c + text.substring(caretPos.end);
                }
                return this.keyboardApply(e, text, true);
            },

            masksPaste() {
                setTimeout(() => {
                    this.maskInit();
                    this.value = this.$refs.phoneField.value;
                    this.$emit('input', this.$refs.phoneField.value);
                    this.$emit('change');
                }, 0);
                return true;
            }
        },

        data() {
            return {
                hint: "Начните вводить номер",
                maskList: [
                    {
                        mask: "+0(###)###-####",
                        name_ru: "Филиппины"
                    },
                    {
                        mask: "+1(242)###-####",
                        name_ru: "Багамские Острова"
                    },
                    {
                        mask: "+1(246)###-####",
                        name_ru: "Барбадос"
                    },
                    {
                        mask: "+1(264)###-####",
                        name_ru: "Ангилья"
                    },
                    {
                        mask: "+1(268)###-####",
                        name_ru: "Антигуа и Барбуда"
                    },
                    {
                        mask: "+1(284)###-####",
                        name_ru: "Британские Виргинские острова"
                    },
                    {
                        mask: "+1(340)###-####",
                        name_ru: "Американские Виргинские острова"
                    },
                    {
                        mask: "+1(345)###-####",
                        name_ru: "Каймановы острова"
                    },
                    {
                        mask: "+1(441)###-####",
                        name_ru: "Бермудские острова"
                    },
                    {
                        mask: "+1(473)###-####",
                        name_ru: "Гренада"
                    },
                    {
                        mask: "+1(649)###-####",
                        name_ru: "Тёркс и Кайкос"
                    },
                    {
                        mask: "+1(664)###-####",
                        name_ru: "Монтсеррат"
                    },
                    {
                        mask: "+1(670)###-####",
                        name_ru: "Северные Марианские острова Сайпан"
                    },
                    {
                        mask: "+1(671)###-####",
                        name_ru: "Гуам"
                    },
                    {
                        mask: "+1(684)###-####",
                        name_ru: "Американское Самоа"
                    },
                    {
                        mask: "+1(721)###-####",
                        name_ru: "Синт-Маартен"
                    },
                    {
                        mask: "+1(758)###-####",
                        name_ru: "Сент-Люсия"
                    },
                    {
                        mask: "+1(767)###-####",
                        name_ru: "Доминика"
                    },
                    {
                        mask: "+1(784)###-####",
                        name_ru: "Сент-Винсент и Гренадины"
                    },
                    {
                        mask: "+1(809)###-####",
                        name_ru: "Доминиканская Республика"
                    },
                    {
                        mask: "+1(829)###-####",
                        name_ru: "Доминиканская Республика"
                    },
                    {
                        mask: "+1(849)###-####",
                        name_ru: "Доминиканская Республика"
                    },
                    {
                        mask: "+1(868)###-####",
                        name_ru: "Тринидад и Тобаго"
                    },
                    {
                        mask: "+1(869)###-####",
                        name_ru: "Сент-Китс и Невис"
                    },
                    {
                        mask: "+1(876)###-####",
                        name_ru: "Ямайка"
                    },
                    {
                        mask: "+1(###)###-####",
                        name_ru: "США и Канада"
                    },
                    {
                        mask: "+20(###)###-####",
                        name_ru: "Египет"
                    },
                    {
                        mask: "+211-##-###-####",
                        name_ru: "Южный Судан"
                    },
                    {
                        mask: "+212-##-####-###",
                        name_ru: "Марокко"
                    },
                    {
                        mask: "+213-##-###-####",
                        name_ru: "Алжир"
                    },
                    {
                        mask: "+216-##-###-###",
                        name_ru: "Тунис"
                    },
                    {
                        mask: "+218-21-###-####",
                        name_ru: "Ливия",
                        desc_ru: "Триполи"
                    },
                    {
                        mask: "+218-##-###-###",
                        name_ru: "Ливия"
                    },
                    {
                        mask: "+220(###)##-##",
                        name_ru: "Гамбия"
                    },
                    {
                        mask: "+221-##-###-####",
                        name_ru: "Сенегал"
                    },
                    {
                        mask: "+222-##-##-####",
                        name_ru: "Мавритания"
                    },
                    {
                        mask: "+223-##-##-####",
                        name_ru: "Мали"
                    },
                    {
                        mask: "+224-##-###-###",
                        name_ru: "Гвинея"
                    },
                    {
                        mask: "+225-##-###-###",
                        name_ru: "Кот-д’Ивуар"
                    },
                    {
                        mask: "+226-##-##-####",
                        name_ru: "Буркина Фасо"
                    },
                    {
                        mask: "+227-##-##-####",
                        name_ru: "Нигер"
                    },
                    {
                        mask: "+228-##-###-###",
                        name_ru: "Того"
                    },
                    {
                        mask: "+229-##-##-####",
                        name_ru: "Бенин"
                    },
                    {
                        mask: "+230-###-####",
                        name_ru: "Маврикий"
                    },
                    {
                        mask: "+231-##-###-###",
                        name_ru: "Либерия"
                    },
                    {
                        mask: "+232-##-######",
                        name_ru: "Сьерра-Леоне"
                    },
                    {
                        mask: "+233(###)###-###",
                        name_ru: "Гана"
                    },
                    {
                        mask: "+234-##-###-##",
                        name_ru: "Нигерия"
                    },
                    {
                        mask: "+234-##-###-###",
                        name_ru: "Нигерия"
                    },
                    {
                        mask: "+234(###)###-####",
                        name_ru: "Нигерия"
                    },
                    {
                        mask: "+234(###)###-####",
                        name_ru: "Нигерия ",
                        desc_ru: "мобильные"
                    },
                    {
                        mask: "+235-##-##-##-##",
                        name_ru: "Чад"
                    },
                    {
                        mask: "+236-##-##-####",
                        name_ru: "Центральноафриканская Республика"
                    },
                    {
                        mask: "+237-####-####",
                        name_ru: "Камерун"
                    },
                    {
                        mask: "+238(###)##-##",
                        name_ru: "Кабо-Верде"
                    },
                    {
                        mask: "+239-##-#####",
                        name_ru: "Сан-Томе и Принсипи"
                    },
                    {
                        mask: "+240-##-###-####",
                        name_ru: "Экваториальная Гвинея"
                    },
                    {
                        mask: "+241-#-##-##-##",
                        name_ru: "Габон"
                    },
                    {
                        mask: "+242-##-###-####",
                        name_ru: "Конго (Браззавиль)"
                    },
                    {
                        mask: "+243(###)###-###",
                        name_ru: "Дем. Респ. Конго (Киншаса)"
                    },
                    {
                        mask: "+244(###)###-###",
                        name_ru: "Ангола"
                    },
                    {
                        mask: "+245-#-######",
                        name_ru: "Гвинея-Бисау"
                    },
                    {
                        mask: "+246-###-####",
                        name_ru: "Диего-Гарсия"
                    },
                    {
                        mask: "+247-####",
                        name_ru: "Остров Вознесения"
                    },
                    {
                        mask: "+248-#-###-###",
                        name_ru: "Сейшелы"
                    },
                    {
                        mask: "+249-##-###-####",
                        name_ru: "Судан"
                    },
                    {
                        mask: "+250(###)###-###",
                        name_ru: "Руанда"
                    },
                    {
                        mask: "+251-##-###-####",
                        name_ru: "Эфиопия"
                    },
                    {
                        mask: "+252-#-###-###",
                        name_ru: "Сомали"
                    },
                    {
                        mask: "+252-#-###-###",
                        name_ru: "Сомали ",
                        desc_ru: "мобильные"
                    },
                    {
                        mask: "+252-##-###-###",
                        name_ru: "Сомали"
                    },
                    {
                        mask: "+253-##-##-##-##",
                        name_ru: "Джибути"
                    },
                    {
                        mask: "+254-###-######",
                        name_ru: "Кения"
                    },
                    {
                        mask: "+255-##-###-####",
                        name_ru: "Танзания"
                    },
                    {
                        mask: "+256(###)###-###",
                        name_ru: "Уганда"
                    },
                    {
                        mask: "+257-##-##-####",
                        name_ru: "Бурунди"
                    },
                    {
                        mask: "+258-##-###-###",
                        name_ru: "Мозамбик"
                    },
                    {
                        mask: "+260-##-###-####",
                        name_ru: "Замбия"
                    },
                    {
                        mask: "+261-##-##-#####",
                        name_ru: "Мадагаскар"
                    },
                    {
                        mask: "+262-#####-####",
                        name_ru: "Майотта"
                    },
                    {
                        mask: "+262-#####-####",
                        name_ru: "Реюньон"
                    },
                    {
                        mask: "+263-#-######",
                        name_ru: "Зимбабве"
                    },
                    {
                        mask: "+264-##-###-####",
                        name_ru: "Намибия"
                    },
                    {
                        mask: "+265-1-###-###",
                        name_ru: "Малави",
                        desc_ru: "Telecom Ltd"
                    },
                    {
                        mask: "+265-#-####-####",
                        name_ru: "Малави"
                    },
                    {
                        mask: "+266-#-###-####",
                        name_ru: "Лесото"
                    },
                    {
                        mask: "+267-##-###-###",
                        name_ru: "Ботсвана"
                    },
                    {
                        mask: "+268-##-##-####",
                        name_ru: "Свазиленд"
                    },
                    {
                        mask: "+269-##-#####",
                        name_ru: "Коморы"
                    },
                    {
                        mask: "+27-##-###-####",
                        name_ru: "Южно-Африканская Респ."
                    },
                    {
                        mask: "+290-####",
                        name_ru: "Остров Святой Елены"
                    },
                    {
                        mask: "+290-####",
                        name_ru: "Тристан-да-Кунья"
                    },
                    {
                        mask: "+291-#-###-###",
                        name_ru: "Эритрея"
                    },
                    {
                        mask: "+297-###-####",
                        name_ru: "Аруба"
                    },
                    {
                        mask: "+298-###-###",
                        name_ru: "Фарерские острова"
                    },
                    {
                        mask: "+299-##-##-##",
                        name_ru: "Гренландия"
                    },
                    {
                        mask: "+30(###)###-####",
                        name_ru: "Греция"
                    },
                    {
                        mask: "+31-##-###-####",
                        name_ru: "Нидерланды"
                    },
                    {
                        mask: "+32(###)###-###",
                        name_ru: "Бельгия"
                    },
                    {
                        mask: "+33(###)###-###",
                        name_ru: "Франция"
                    },
                    {
                        mask: "+34(###)###-###",
                        name_ru: "Испания"
                    },
                    {
                        mask: "+350-###-#####",
                        name_ru: "Гибралтар"
                    },
                    {
                        mask: "+351-##-###-####",
                        name_ru: "Португалия"
                    },
                    {
                        mask: "+352(###)###-###",
                        name_ru: "Люксембург"
                    },
                    {
                        mask: "+353(###)###-###",
                        name_ru: "Ирландия"
                    },
                    {
                        mask: "+354-###-####",
                        name_ru: "Исландия"
                    },
                    {
                        mask: "+355(###)###-###",
                        name_ru: "Албания"
                    },
                    {
                        mask: "+356-####-####",
                        name_ru: "Мальта"
                    },
                    {
                        mask: "+357-##-###-###",
                        name_ru: "Кипр"
                    },
                    {
                        mask: "+358(###)###-##-##",
                        name_ru: "Финляндия"
                    },
                    {
                        mask: "+359(###)###-###",
                        name_ru: "Болгария"
                    },
                    {
                        mask: "+36(###)###-###",
                        name_ru: "Венгрия"
                    },
                    {
                        mask: "+370(###)##-###",
                        name_ru: "Литва"
                    },
                    {
                        mask: "+371-##-###-###",
                        name_ru: "Латвия"
                    },
                    {
                        mask: "+372-###-####",
                        name_ru: "Эстония"
                    },
                    {
                        mask: "+372-####-####",
                        name_ru: "Эстония ",
                        desc_ru: "мобильные"
                    },
                    {
                        mask: "+373-####-####",
                        name_ru: "Молдова"
                    },
                    {
                        mask: "+374-##-###-###",
                        name_ru: "Армения"
                    },
                    {
                        mask: "+375(##)###-##-##",
                        name_ru: "Беларусь (Белоруссия)"
                    },
                    {
                        mask: "+376-###-###",
                        name_ru: "Андорра"
                    },
                    {
                        mask: "+377-##-###-###",
                        name_ru: "Монако"
                    },
                    {
                        mask: "+377(###)###-###",
                        name_ru: "Монако"
                    },
                    {
                        mask: "+378-####-######",
                        name_ru: "Сан-Марино"
                    },
                    {
                        mask: "+380(##)###-##-##",
                        name_ru: "Украина"
                    },
                    {
                        mask: "+381-##-###-####",
                        name_ru: "Сербия"
                    },
                    {
                        mask: "+382-##-###-###",
                        name_ru: "Черногория"
                    },
                    {
                        mask: "+385-##-###-###",
                        name_ru: "Хорватия"
                    },
                    {
                        mask: "+386-##-###-###",
                        name_ru: "Словения"
                    },
                    {
                        mask: "+387-##-####",
                        name_ru: "Босния и Герцеговина"
                    },
                    {
                        mask: "+387-##-#####",
                        name_ru: "Босния и Герцеговина"
                    },
                    {
                        mask: "+389-##-###-###",
                        name_ru: "Респ. Македония"
                    },
                    {
                        mask: "+39-6-698-#####",
                        name_ru: "Ватикан"
                    },
                    {
                        mask: "+39(###)####-###",
                        name_ru: "Италия"
                    },
                    {
                        mask: "+40-##-###-####",
                        name_ru: "Румыния"
                    },
                    {
                        mask: "+41-##-###-####",
                        name_ru: "Швейцария"
                    },
                    {
                        mask: "+420(###)###-###",
                        name_ru: "Чехия"
                    },
                    {
                        mask: "+421(###)###-###",
                        name_ru: "Словакия"
                    },
                    {
                        mask: "+423(###)###-####",
                        name_ru: "Лихтенштейн"
                    },
                    {
                        mask: "+43(###)###-####",
                        name_ru: "Австрия"
                    },
                    {
                        mask: "+44-##-####-####",
                        name_ru: "Великобритания"
                    },
                    {
                        mask: "+45-##-##-##-##",
                        name_ru: "Дания"
                    },
                    {
                        mask: "+46-##-###-####",
                        name_ru: "Швеция"
                    },
                    {
                        mask: "+47(###)##-###",
                        name_ru: "Норвегия"
                    },
                    {
                        mask: "+48(###)###-###",
                        name_ru: "Польша"
                    },
                    {
                        mask: "+49-###-###",
                        name_ru: "Германия"
                    },
                    {
                        mask: "+49(###)##-##",
                        name_ru: "Германия"
                    },
                    {
                        mask: "+49(###)##-###",
                        name_ru: "Германия"
                    },
                    {
                        mask: "+49(###)##-####",
                        name_ru: "Германия"
                    },
                    {
                        mask: "+49(###)###-####",
                        name_ru: "Германия"
                    },
                    {
                        mask: "+49(####)###-####",
                        name_ru: "Германия"
                    },
                    {
                        mask: "+500-#####",
                        name_ru: "Фолклендские острова"
                    },
                    {
                        mask: "+501-###-####",
                        name_ru: "Белиз"
                    },
                    {
                        mask: "+502-#-###-####",
                        name_ru: "Гватемала"
                    },
                    {
                        mask: "+503-##-##-####",
                        name_ru: "Сальвадор"
                    },
                    {
                        mask: "+504-####-####",
                        name_ru: "Гондурас"
                    },
                    {
                        mask: "+505-####-####",
                        name_ru: "Никарагуа"
                    },
                    {
                        mask: "+506-####-####",
                        name_ru: "Коста-Рика"
                    },
                    {
                        mask: "+507-###-####",
                        name_ru: "Панама"
                    },
                    {
                        mask: "+508-##-####",
                        name_ru: "Сен-Пьер и Микелон"
                    },
                    {
                        mask: "+509-##-##-####",
                        name_ru: "Гаити"
                    },
                    {
                        mask: "+51(###)###-###",
                        name_ru: "Перу"
                    },
                    {
                        mask: "+52-##-##-####",
                        name_ru: "Мексика"
                    },
                    {
                        mask: "+52(###)###-####",
                        name_ru: "Мексика"
                    },
                    {
                        mask: "+53-#-###-####",
                        name_ru: "Куба"
                    },
                    {
                        mask: "+54(###)###-####",
                        name_ru: "Аргентина"
                    },
                    {
                        mask: "+55(##)7###-####",
                        name_ru: "Бразилия",
                        desc_ru: "мобильные"
                    },
                    {
                        mask: "+55(##)9####-####",
                        name_ru: "Бразилия",
                        desc_ru: "мобильные"
                    },
                    {
                        mask: "+55(##)####-####",
                        name_ru: "Бразилия"
                    },
                    {
                        mask: "+56-#-####-####",
                        name_ru: "Чили"
                    },
                    {
                        mask: "+57(###)###-####",
                        name_ru: "Колумбия"
                    },
                    {
                        mask: "+58(###)###-####",
                        name_ru: "Венесуэла"
                    },
                    {
                        mask: "+590(###)###-###",
                        name_ru: "Гваделупа"
                    },
                    {
                        mask: "+591-#-###-####",
                        name_ru: "Боливия"
                    },
                    {
                        mask: "+592-###-####",
                        name_ru: "Гайана"
                    },
                    {
                        mask: "+593-#-###-####",
                        name_ru: "Эквадор"
                    },
                    {
                        mask: "+593-##-###-####",
                        name_ru: "Эквадор ",
                        desc_ru: "мобильные"
                    },
                    {
                        mask: "+594-#####-####",
                        name_ru: "Фр. Гвиана"
                    },
                    {
                        mask: "+595(###)###-###",
                        name_ru: "Парагвай"
                    },
                    {
                        mask: "+596(###)##-##-##",
                        name_ru: "Мартиника"
                    },
                    {
                        mask: "+597-###-###",
                        name_ru: "Суринам"
                    },
                    {
                        mask: "+597-###-####",
                        name_ru: "Суринам ",
                        desc_ru: "мобильные"
                    },
                    {
                        mask: "+598-#-###-##-##",
                        name_ru: "Уругвай"
                    },
                    {
                        mask: "+599-9###-####",
                        name_ru: "Нидерландские Антильские острова",
                        desc_ru: "Кюрасао"
                    },
                    {
                        mask: "+599-###-####",
                        name_ru: "Карибские Нидерланды"
                    },
                    {
                        mask: "+599-###-####",
                        name_ru: "Нидерландские Антильские острова"
                    },
                    {
                        mask: "+599-###-####",
                        name_ru: "Кюрасао"
                    },
                    {
                        mask: "+60-#-###-###",
                        name_ru: "Малайзия"
                    },
                    {
                        mask: "+60-##-###-###",
                        name_ru: "Малайзия"
                    },
                    {
                        mask: "+60-##-###-####",
                        name_ru: "Малайзия ",
                        desc_ru: "мобильные"
                    },
                    {
                        mask: "+60(###)###-###",
                        name_ru: "Малайзия"
                    },
                    {
                        mask: "+61-#-####-####",
                        name_ru: "Австралия"
                    },
                    {
                        mask: "+62(8##)###-###",
                        name_ru: "Индонезия ",
                        desc_ru: "мобильные"
                    },
                    {
                        mask: "+62(8##)###-####",
                        name_ru: "Индонезия ",
                        desc_ru: "мобильные"
                    },
                    {
                        mask: "+62(8##)###-##-###",
                        name_ru: "Индонезия ",
                        desc_ru: "мобильные"
                    },
                    {
                        mask: "+62-##-###-##",
                        name_ru: "Индонезия"
                    },
                    {
                        mask: "+62-##-###-###",
                        name_ru: "Индонезия"
                    },
                    {
                        mask: "+62-##-###-####",
                        name_ru: "Индонезия"
                    },
                    {
                        mask: "+63(###)###-####",
                        name_ru: "Филиппины"
                    },
                    {
                        mask: "+64-##-###-###",
                        name_ru: "Новая Зеландия"
                    },
                    {
                        mask: "+64(###)###-###",
                        name_ru: "Новая Зеландия"
                    },
                    {
                        mask: "+64(###)###-####",
                        name_ru: "Новая Зеландия"
                    },
                    {
                        mask: "+65-####-####",
                        name_ru: "Сингапур"
                    },
                    {
                        mask: "+66-##-###-###",
                        name_ru: "Таиланд"
                    },
                    {
                        mask: "+66-##-###-####",
                        name_ru: "Таиланд ",
                        desc_ru: "мобильные"
                    },
                    {
                        mask: "+670-77#-#####",
                        name_ru: "Восточный Тимор",
                        desc_ru: "Timor Telecom"
                    },
                    {
                        mask: "+670-78#-#####",
                        name_ru: "Восточный Тимор",
                        desc_ru: "Timor Telecom"
                    },
                    {
                        mask: "+670-###-####",
                        name_ru: "Восточный Тимор"
                    },
                    {
                        mask: "+672-1##-###",
                        name_ru: "Австралийская антарктическая база"
                    },
                    {
                        mask: "+672-3##-###",
                        name_ru: "Норфолк (остров)"
                    },
                    {
                        mask: "+673-###-####",
                        name_ru: "Бруней-Даруссалам"
                    },
                    {
                        mask: "+674-###-####",
                        name_ru: "Науру"
                    },
                    {
                        mask: "+675(###)##-###",
                        name_ru: "Папуа-Новая Гвинея"
                    },
                    {
                        mask: "+676-#####",
                        name_ru: "Тонга"
                    },
                    {
                        mask: "+677-#####",
                        name_ru: "Соломоновы Острова"
                    },
                    {
                        mask: "+677-###-####",
                        name_ru: "Соломоновы Острова ",
                        desc_ru: "мобильные"
                    },
                    {
                        mask: "+678-#####",
                        name_ru: "Вануату"
                    },
                    {
                        mask: "+678-##-#####",
                        name_ru: "Вануату ",
                        desc_ru: "мобильные"
                    },
                    {
                        mask: "+679-##-#####",
                        name_ru: "Фиджи"
                    },
                    {
                        mask: "+680-###-####",
                        name_ru: "Палау"
                    },
                    {
                        mask: "+681-##-####",
                        name_ru: "Уоллис и Футуна"
                    },
                    {
                        mask: "+682-##-###",
                        name_ru: "Острова Кука"
                    },
                    {
                        mask: "+683-####",
                        name_ru: "Ниуэ"
                    },
                    {
                        mask: "+685-##-####",
                        name_ru: "Самоа"
                    },
                    {
                        mask: "+686-##-###",
                        name_ru: "Кирибати"
                    },
                    {
                        mask: "+687-##-####",
                        name_ru: "Новая Каледония"
                    },
                    {
                        mask: "+688-2####",
                        name_ru: "Тувалу"
                    },
                    {
                        mask: "+688-90####",
                        name_ru: "Тувалу ",
                        desc_ru: "мобильные"
                    },
                    {
                        mask: "+689-##-##-##",
                        name_ru: "Французская Полинезия (Таити)"
                    },
                    {
                        mask: "+690-####",
                        name_ru: "Токелау"
                    },
                    {
                        mask: "+691-###-####",
                        name_ru: "Ф.Ш. Микронезии"
                    },
                    {
                        mask: "+692-###-####",
                        name_ru: "Маршалловы Острова"
                    },
                    {
                        mask: "+7(6##)###-##-##",
                        name_ru: "Казахстан"
                    },
                    {
                        mask: "+7(7##)###-##-##",
                        name_ru: "Казахстан"
                    },
                    {
                        mask: "+7(###)###-##-##",
                        name_ru: "Россия"
                    },
                    {
                        mask: "+81(###)###-###",
                        name_ru: "Япония"
                    },
                    {
                        mask: "+81-##-####-####",
                        name_ru: "Япония ",
                        desc_ru: "мобильные"
                    },
                    {
                        mask: "+82-##-###-####",
                        name_ru: "Респ. Корея"
                    },
                    {
                        mask: "+84-##-####-###",
                        name_ru: "Вьетнам"
                    },
                    {
                        mask: "+84(###)####-###",
                        name_ru: "Вьетнам"
                    },
                    {
                        mask: "+850-191-###-####",
                        name_ru: "Корейская НДР ",
                        desc_ru: "мобильные"
                    },
                    {
                        mask: "+850-###-###",
                        name_ru: "Корейская НДР"
                    },
                    {
                        mask: "+850-##-###-###",
                        name_ru: "Корейская НДР"
                    },
                    {
                        mask: "+850-####-####",
                        name_ru: "Корейская НДР"
                    },
                    {
                        mask: "+850-###-####-###",
                        name_ru: "Корейская НДР"
                    },
                    {
                        mask: "+850-####-#############",
                        name_ru: "Корейская НДР"
                    },
                    {
                        mask: "+852-####-####",
                        name_ru: "Гонконг"
                    },
                    {
                        mask: "+853-####-####",
                        name_ru: "Макао"
                    },
                    {
                        mask: "+855-##-###-###",
                        name_ru: "Камбоджа"
                    },
                    {
                        mask: "+856(20##)###-###",
                        name_ru: "Лаос ",
                        desc_ru: "мобильные"
                    },
                    {
                        mask: "+856-##-###-###",
                        name_ru: "Лаос"
                    },
                    {
                        mask: "+86(###)####-###",
                        name_ru: "Китайская Н.Р."
                    },
                    {
                        mask: "+86(###)####-####",
                        name_ru: "Китайская Н.Р."
                    },
                    {
                        mask: "+87-##-#####-#####",
                        name_ru: "Китайская Н.Р."
                    },
                    {
                        mask: "+88-##-###-###",
                        name_ru: "Бангладеш"
                    },
                    {
                        mask: "+886-####-####",
                        name_ru: "Тайвань"
                    },
                    {
                        mask: "+886-#-####-####",
                        name_ru: "Тайвань"
                    },
                    {
                        mask: "+889-#-####-####",
                        name_ru: "Тайвань"
                    },
                    {
                        mask: "+89-#-####-####",
                        name_ru: "Тайвань"
                    },
                    {
                        mask: "+90(###)###-####",
                        name_ru: "Турция"
                    },
                    {
                        mask: "+91(####)###-###",
                        name_ru: "Индия"
                    },
                    {
                        mask: "+92(###)###-####",
                        name_ru: "Пакистан"
                    },
                    {
                        mask: "+93-##-###-####",
                        name_ru: "Афганистан"
                    },
                    {
                        mask: "+94-##-###-####",
                        name_ru: "Шри-Ланка"
                    },
                    {
                        mask: "+95-###-###",
                        name_ru: "Бирма (Мьянма)"
                    },
                    {
                        mask: "+95-#-###-###",
                        name_ru: "Бирма (Мьянма)"
                    },
                    {
                        mask: "+95-##-###-###",
                        name_ru: "Бирма (Мьянма)"
                    },
                    {
                        mask: "+960-###-####",
                        name_ru: "Мальдивские острова"
                    },
                    {
                        mask: "+961-#-###-###",
                        name_ru: "Ливан"
                    },
                    {
                        mask: "+961-##-###-###",
                        name_ru: "Ливан ",
                        desc_ru: "мобильные"
                    },
                    {
                        mask: "+962-#-####-####",
                        name_ru: "Иордания"
                    },
                    {
                        mask: "+963-##-####-###",
                        name_ru: "Сирийская арабская республика"
                    },
                    {
                        mask: "+964(###)###-####",
                        name_ru: "Ирак"
                    },
                    {
                        mask: "+965-####-####",
                        name_ru: "Кувейт"
                    },
                    {
                        mask: "+966-5-####-####",
                        name_ru: "Саудовская Аравия ",
                        desc_ru: "мобильные"
                    },
                    {
                        mask: "+966-#-###-####",
                        name_ru: "Саудовская Аравия"
                    },
                    {
                        mask: "+967-#-###-###",
                        name_ru: "Йемен"
                    },
                    {
                        mask: "+967-##-###-###",
                        name_ru: "Йемен"
                    },
                    {
                        mask: "+967-###-###-###",
                        name_ru: "Йемен ",
                        desc_ru: "мобильные"
                    },
                    {
                        mask: "+968-##-###-###",
                        name_ru: "Оман"
                    },
                    {
                        mask: "+970-##-###-####",
                        name_ru: "Палестина"
                    },
                    {
                        mask: "+971-5#-###-####",
                        name_ru: "Объединенные Арабские Эмираты",
                        desc_ru: "мобильные"
                    },
                    {
                        mask: "+971-#-###-####",
                        name_ru: "Объединенные Арабские Эмираты"
                    },
                    {
                        mask: "+972-5#-###-####",
                        name_ru: "Израиль ",
                        desc_ru: "мобильные"
                    },
                    {
                        mask: "+972-#-###-####",
                        name_ru: "Израиль"
                    },
                    {
                        mask: "+973-####-####",
                        name_ru: "Бахрейн"
                    },
                    {
                        mask: "+974-####-####",
                        name_ru: "Катар"
                    },
                    {
                        mask: "+975-17-###-###",
                        name_ru: "Бутан"
                    },
                    {
                        mask: "+975-#-###-###",
                        name_ru: "Бутан"
                    },
                    {
                        mask: "+976-##-##-####",
                        name_ru: "Монголия"
                    },
                    {
                        mask: "+977-##-###-###",
                        name_ru: "Непал"
                    },
                    {
                        mask: "+98(###)###-####",
                        name_ru: "Иран"
                    },
                    {
                        mask: "+992-##-###-####",
                        name_ru: "Таджикистан"
                    },
                    {
                        mask: "+993-#-###-####",
                        name_ru: "Туркменистан"
                    },
                    {
                        mask: "+994-##-###-##-##",
                        name_ru: "Азербайджан"
                    },
                    {
                        mask: "+995(###)###-###",
                        name_ru: "Грузия"
                    },
                    {
                        mask: "+996(###)###-###",
                        name_ru: "Киргизия"
                    },
                    {
                        mask: "+998-##-###-####",
                        name_ru: "Узбекистан"
                    },
                    {
                        mask: "+0",
                        name_ru: ""
                    }
                ]
            };
        }
    };
</script>

