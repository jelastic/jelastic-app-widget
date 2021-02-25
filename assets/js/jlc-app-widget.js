(function () {
    // init scripts
    const wrapper_elements = document.getElementsByClassName('jlc-app');
    const body = document.getElementsByTagName('body')[0];
    var galoaded = document.querySelector('script[src*="google-analytics.com/analytics.js"]');

    Array.from(wrapper_elements).forEach((wrapper) => {
        ToggleShowElement(wrapper, false);

        const app_id = wrapper.getAttribute('data-app-id') || false,
            manifest = wrapper.getAttribute('data-manifest') || false;

        if ((!!app_id && !!manifest) || (!app_id && !manifest)) {
            console.error('Jelastic install app widget: Please input one application parameter (data-app-id OR data-manifest).');
            return false;
        }

        if (!!manifest) {
            if (!isURL(manifest) && !manifest.startsWith('{')) {
                console.error('Jelastic install app widget: Manifest parameter is incorrect');
                return false;
            }
        }

        const jlc_button_text = wrapper.getAttribute('data-text') || 'GET STARTED FOR FREE';
        var gacode = wrapper.getAttribute('data-track-ga') || false;
        galoaded = document.querySelector('script[src*="google-analytics.com/analytics.js"]');

        if(!galoaded && !!gacode) {
            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){ (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o), m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m) })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
            ga('create', gacode, 'auto', {'allowLinker': true});
            ga('require', 'linker');
            ga('linker:autoLink', ['jelastic.cloud']);
            ga('send', 'pageview');
        }

        // create HTML elements
        // create main element
        const jlc_cover_element = CreateElement('div', {
            className: 'jlc-app-cover'
        });
        wrapper.appendChild(jlc_cover_element);

        // create main button
        const jlc_btn_element = CreateElement('button', {
            className: 'jlc-btn'
        }, jlc_button_text);
        jlc_cover_element.appendChild(jlc_btn_element);

        // create main form
        const jlc_form_element = CreateElement('form', {
            className: 'jlc-form jlc-form__focused'
        });
        jlc_cover_element.appendChild(jlc_form_element);

        // create email input
        const jlc_input_element = CreateElement('input', {
            className: 'jlc-input',
            placeholder: 'your@email.com',
            type: 'text',
            required: 'true',
            name: 'email'
        });
        jlc_form_element.appendChild(jlc_input_element);

        // create form button
        const jlc_sbmt_element = CreateElement('button', {
            className: 'jlc-sbmt'
        });
        jlc_form_element.appendChild(jlc_sbmt_element);

        // EVENTS
        // show form
        jlc_btn_element.addEventListener('click', ShowForm);
        // send form
        if (jlc_form_element.addEventListener) {
            jlc_form_element.addEventListener('submit', SubmitForm, false); //Modern browsers
        } else if (jlc_form_element.attachEvent) {
            jlc_form_element.attachEvent('onsubmit', SubmitForm); //Old IE
        }

        jlc_input_element.addEventListener("change", ValidateInputedEmail, false);
        jlc_input_element.addEventListener("keyup", ValidateInputedEmail, false);

        ToggleShowElement(wrapper, true)

    });


    // FUNCTIONS
    /* create DOM element function.
      tagName - type of new html tag | string
      attrs - element attributes, like class, placeholder ... | object {attribute_name : 'attribute_value'}
      text - inner text of element. leave blank if the block does not contain text | string
    */

    function CreateElement(tagName, attrs, text) {
        const element = document.createElement(tagName);
        if (attrs) {
            for (let attribute in attrs) {
                let value = attrs[attribute];
                if (attribute === 'className') {
                    attribute = 'class';
                }
                let element_attribute = document.createAttribute(attribute);
                element_attribute.value = value;
                element.setAttributeNode(element_attribute);
            }
        }
        if (text) {
            let element_content = document.createTextNode(text);
            element.appendChild(element_content);
        }
        return element;
    }

    function ShowForm() {
        const wrapper = FindClosestAncestor(this, '.jlc-app'),
            jlc_cover_element = wrapper.getElementsByClassName("jlc-app-cover")[0],
            jlc_form_element = wrapper.getElementsByClassName("jlc-form")[0],
            jlc_form_btn = wrapper.getElementsByClassName("jlc-btn")[0],
            active_widgets = document.querySelectorAll('.jlc-app-cover.is_active'),
            errors = document.getElementsByClassName('jlc-error');

        if (errors.length > 0) {
            errors[0].remove();
        }

        if (active_widgets.length > 0) {
            var active_widget = active_widgets[0],
                active_form = active_widget.getElementsByTagName('form')[0],
                other_form_input = active_form.getElementsByClassName('jlc-input')[0];

            VanilaRemoveClasss(active_widget, 'is_active');

            if (!active_form.classList.contains('jlc-form__succeed')) {
                other_form_input.value = '';
                VanilaRemoveClasss(active_form, 'jlc-form__valid');
            }

        }

        VanilaAddClass(jlc_cover_element, 'is_active');
        const jlc_form_element_style = window.getComputedStyle(jlc_form_element);
        const jlc_form_element_minWidth = jlc_form_element_style.getPropertyValue('min-width');
        if (parseInt(jlc_form_element_minWidth) !== 0) {
            wrapper.style.width = wrapper.style.minWidth = jlc_form_btn.style.width = jlc_form_element_minWidth;
        }
    }

    function VanilaAddClass(element, className) {
        if (element.classList) {
            element.classList.add(className);
        } else {
            element.className += ' ' + className;
        }
    }

    function VanilaRemoveClasss(element, className) {
        if (element.classList.contains(className)) {
            element.classList.remove(className);
        }
    }

    function ValidateInputedEmail(event) {
        const element = event.target;
        const wrapper = FindClosestAncestor(element, '.jlc-app');
        const jlc_form_element = wrapper.getElementsByClassName("jlc-form")[0];
        let result = ValidateEmail(event.target.value);
        if (result) {
            VanilaAddClass(jlc_form_element, 'jlc-form__valid');
        } else {
            VanilaRemoveClasss(jlc_form_element, 'jlc-form__valid')
        }
    }

    function FindClosestAncestor(element, selector) {
        while ((element = element.parentElement) && !((element.matches || element.matchesSelector).call(element, selector))) ;
        return element;
    }

    function ShowErrorMessage(message, jlcWrapper) {
        const jlc_error_element = CreateElement('div', {
            class: 'jlc-error'
        }, message);
        jlcWrapper.appendChild(jlc_error_element);
    }

    function ToggleShowElement(wrapper, status) {
        let opacity = '0.5',
            filter = 'blur(4px)'
        if (status) {
            opacity = '1',
                filter = 'none'
        }
        wrapper.style.opacity = opacity;
        wrapper.style.filter = filter;
    }

    function ValidateEmail(email) {
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    function modalShow(el) {
        body.classList.add('modal-open');
        el.style.display = "flex";
        el.style.opacity = 1;
    }

    function modalHide(el, fnCallback) {

        el.style.opacity = 0;
        el.style.display = "none";

        var loading = el.getElementsByClassName('loading'),
            checkbox_wrapper = el.getElementsByClassName('jlc-gdpr--checkbox')[0],
            jlc_sbmt_element = el.getElementsByClassName("jlc-form--submit")[0];


        if (checkbox_wrapper) {
            var checkbox = checkbox_wrapper.getElementsByTagName('input')[0];
            checkbox.checked = false;
            jlc_sbmt_element.setAttribute('disabled', 'disabled');
            jlc_sbmt_element.classList.add('submit-disabled');
        }

        if (loading[0]) {
            loading[0].classList.remove('loading');
        }

        if (fnCallback) {
            fnCallback();
        }
    }

    function trackGA(oParams) {

        var oOptions = {
            "hitType": "event",
            "eventCategory": oParams.category,
            "eventAction": oParams.action || '',
            "eventLabel": oParams.label || ''
        };
        

        if (Object.prototype.hasOwnProperty.call(oParams, "value")) {
            oOptions.eventValue = oParams.value;
        }

        if (window.ga) {
            ga("send", oOptions);
        }


        if (oOptions.hitCallback) {
            if (window.ga) {
                setTimeout(oParams.hitCallback, 1500);
            } else {
                oOptions.hitCallback();
            }
        }
    }

    function trackInstallSuccess(sHoster, app) {
        trackGA({
            category: "installapp-widget-success",
            action: sHoster,
            label: app,
        });
    }

    function trackInstallError(sHoster, app) {
        trackGA({
            category: "installapp-widget-error",
            action: sHoster,
            label: app
        });
    }

    function isURL(str) {
        var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
            '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        return !!pattern.test(str);
    }

    function SubmitForm(event) {
        event.preventDefault();

        const wrapper = FindClosestAncestor(this, '.jlc-app'),
            jlc_form_element = wrapper.getElementsByClassName("jlc-form")[0],
            jlc_sbmt_element = wrapper.getElementsByClassName("jlc-sbmt")[0],
            jlc_input_element = wrapper.getElementsByClassName("jlc-input")[0],
            trackEvent = !!wrapper.getAttribute('data-track-ga') || false;

        if (!jlc_form_element.classList.contains('jlc-form__valid')) {
            ShowErrorMessage('Email is not valid', wrapper);
            return;
        }

        const jlc_text_error = wrapper.getAttribute('data-tx-error') || 'An error has occurred, please try again later',
            jlc_text_success = wrapper.getAttribute('data-tx-success') || 'CHECK YOUR EMAIL',
            app_id = wrapper.getAttribute('data-app-id') || false,
            manifest = wrapper.getAttribute('data-manifest') || false,
            group = wrapper.getAttribute('data-group') || '',
            jlc_hoster_domain = wrapper.getAttribute('data-key') || false;

        VanilaAddClass(jlc_form_element, 'jlc-form__sending');

        // check if error message is shown and delete it
        let jlc_error_element = document.getElementsByClassName('jlc-error')[0];
        if (typeof (jlc_error_element) != 'undefined' && jlc_error_element != null) {
            wrapper.removeChild(jlc_error_element)
        }

        const email = jlc_input_element.value,
            modal = document.getElementById('AppHostersModal');

        if (modal && wrapper.classList.contains('hosters-modal-call')) {
            const modal_email = document.getElementById('user_email');
            modal_email.value = email;

            modalShow(modal);
            VanilaRemoveClasss(jlc_form_element, 'jlc-form__sending');

        } else {

            var installAppURL = jlc_hoster_domain.replace('app.', 'reg.');
            installAppURL = '//' + installAppURL + '/installapp';

            var data = {
                email: email,
                key: jlc_hoster_domain,
                group: group,
                iref: document.location.href,
                eref: document.referrer,
                lang: 'en'
            };

            if (app_id) {
                data['id'] = app_id;
            } else {
                data['manifest'] = manifest;
            }

            $.ajax({
                type: 'POST',
                data: data,
                url: installAppURL,
                success: function (response) {
                    var oResp = jQuery.parseJSON(response) || {};

                    if (oResp.response.result === 0 && oResp.response) {
                        VanilaRemoveClasss(jlc_form_element, 'jlc-form__sending');
                        VanilaAddClass(jlc_form_element, 'jlc-form__succeed')
                        jlc_sbmt_element.disabled = jlc_input_element.disabled = true;
                        jlc_input_element.value = jlc_text_success;

                        if (trackEvent) {
                            trackInstallSuccess(jlc_hoster_domain, app_id);
                        }
                    } else {
                        ShowErrorMessage(jlc_text_error, wrapper);
                        VanilaRemoveClasss(jlc_form_element, 'jlc-form__sending');
                        if (trackEvent) {
                            trackInstallError(jlc_hoster_domain, app_id);
                        }
                    }
                },
                error: function (response) {
                    ShowErrorMessage(jlc_text_error, wrapper);
                    VanilaRemoveClasss(jlc_form_element, 'jlc-form__sending');
                    if (trackEvent) {
                        trackInstallError(jlc_hoster_domain, app_id);
                    }
                }
            });
        }
    }

    $.each(wrapper_elements, function (index, wrapper) {
        if (!$(wrapper).attr('data-key')) {
            $(wrapper).addClass('hosters-modal-call');
            if (!window.hosters) {
                (function () {
                    $.ajax({
                            type: "GET",
                            url: "//platforms-info.jelastic.com/api/site/GetHosters",
                            async: false,
                            success: function (response) {

                                var oResp;

                                if (response.result === 0 && response.hosters) {
                                    window.hosters = response.hosters;

                                    $.ajax({
                                        type: "GET",
                                        url: "//platforms-info.jelastic.com/api/user/getdefhoster",
                                        async: true,
                                        success: function (response) {

                                            var oResp = jQuery.parseJSON(response) || {};

                                            if (oResp.result === 0 && oResp.response) {
                                                oResp = oResp.response;
                                            }

                                            var defhoster = oResp.hoster;


                                            var currentHosterIndex = -1;
                                            $.each(window.hosters, function (index, hoster) {
                                                if (hoster.keyword === defhoster) {
                                                    currentHosterIndex = index;
                                                }
                                            });

                                            if (currentHosterIndex !== -1) {
                                                window.hosters.splice(0, 0, window.hosters.splice(currentHosterIndex, 1)[0]);
                                            }


                                            const hosters_modal_element = CreateElement('div', {
                                                className: 'app_hosters_modal',
                                                id: 'AppHostersModal'
                                            });
                                            body.append(hosters_modal_element);

                                            hosters_modal_element.addEventListener('click', function (e) {
                                                if (e.target === hosters_modal_element) {
                                                    modalHide(hosters_modal_element, function () {
                                                        var active_widget = document.querySelectorAll('.jlc-app-cover.is_active')[0],
                                                            active_form = active_widget.getElementsByTagName('form')[0],
                                                            other_form_input = active_form.getElementsByClassName('jlc-input')[0];

                                                        VanilaRemoveClasss(active_form, 'jlc-form__valid');
                                                        VanilaRemoveClasss(active_widget, 'is_active');
                                                        other_form_input.value = '';

                                                        VanilaRemoveClasss(active_widget, 'is_active');
                                                        VanilaRemoveClasss(body, 'modal-open');

                                                    })
                                                }
                                            });

                                            const modal_dialog = CreateElement('div', {
                                                className: 'modal-dialog',
                                            });
                                            hosters_modal_element.append(modal_dialog);

                                            const modal_content = CreateElement('div', {
                                                className: 'modal-content',
                                            });
                                            modal_dialog.append(modal_content);

                                            const jlc_modal_title = CreateElement('span', {
                                                className: 'jlc-modal--title',
                                            }, 'Choose Service Provider to Install Application');
                                            modal_content.append(jlc_modal_title);

                                            const jlc_modal_close = CreateElement('span', {
                                                className: 'jlc-modal--close',
                                                'data-dismiss': 'modal',
                                            });
                                            jlc_modal_title.append(jlc_modal_close);
                                            jlc_modal_close.addEventListener('click', function (e) {
                                                modalHide(hosters_modal_element, function () {
                                                    document.querySelectorAll('.jlc-app-cover.is_active')[0].classList.remove('is_active');
                                                    body.classList.remove('modal-open');
                                                })
                                            });

                                            const jlc_modal_form = CreateElement('form', {
                                                className: 'jlc-modal--form',
                                                action: '#'
                                            });
                                            modal_content.append(jlc_modal_form);

                                            // send form
                                            if (jlc_modal_form.addEventListener) {
                                                jlc_modal_form.addEventListener('submit', SubmitModalForm, false);
                                            } else if (jlc_modal_form.attachEvent) {
                                                jlc_modal_form.attachEvent('onsubmit', SubmitModalForm);
                                            }

                                            function SubmitModalForm(event) {
                                                event.preventDefault();

                                                const wrapper = FindClosestAncestor(document.querySelectorAll('.hosters-modal-call .jlc-app-cover.is_active')[0], '.jlc-app'),
                                                    jlc_form_element = wrapper.getElementsByClassName("jlc-form")[0],
                                                    jlc_sbmt_element = wrapper.getElementsByClassName("jlc-sbmt")[0],
                                                    jlc_input_element = wrapper.getElementsByClassName("jlc-input")[0],
                                                    jlc_text_error = wrapper.getAttribute('data-tx-error') || 'An error has occurred, please try again later',
                                                    jlc_text_success = wrapper.getAttribute('data-tx-success') || 'CHECK YOUR EMAIL',
                                                    trackEvent = !!wrapper.getAttribute('data-track-ga') || false,
                                                    app_id = wrapper.getAttribute('data-app-id') || false,
                                                    manifest = wrapper.getAttribute('data-manifest') || false,
                                                    group = wrapper.getAttribute('data-group') || '',
                                                    jlc_hoster_domain = this.querySelector('input[name="hoster"]:checked').getAttribute('data-key') || false,
                                                    jlc_email_element = document.getElementById('user_email');



                                                VanilaAddClass(this, 'loading');

                                                // check if error message is shown and delete it
                                                let jlc_error_element = document.getElementsByClassName('jlc-error')[0];

                                                const email = jlc_email_element.value;

                                                const msg = JSON.stringify({
                                                    app: app_id,
                                                    email: email,
                                                    group: group,
                                                });

                                                var installAppURL = jlc_hoster_domain.replace('app.', 'reg.');
                                                installAppURL = '//' + installAppURL + '/installapp';

                                                var data = {
                                                    email: email,
                                                    key: jlc_hoster_domain,
                                                    group: group,
                                                    iref: document.location.href,
                                                    eref: document.referrer,
                                                    lang: 'en'
                                                };

                                                if (app_id) {
                                                    data['id'] = app_id;
                                                } else {
                                                    data['manifest'] = manifest;
                                                }

                                                $.ajax({
                                                    type: 'POST',
                                                    data: data,
                                                    url: installAppURL,
                                                    success: function (response) {
                                                        var oResp = jQuery.parseJSON(response) || {};

                                                        if (oResp.response.result === 0 && oResp.response) {
                                                            modalHide(hosters_modal_element, function () {
                                                                body.classList.remove('modal-open');
                                                            });
                                                            VanilaRemoveClasss(jlc_form_element, 'jlc-form__sending');
                                                            VanilaAddClass(jlc_form_element, 'jlc-form__succeed');
                                                            jlc_sbmt_element.disabled = jlc_input_element.disabled = true;
                                                            jlc_input_element.value = jlc_text_success;
                                                            if (trackEvent) {
                                                                trackInstallSuccess(jlc_hoster_domain, msg);
                                                            }
                                                        } else {
                                                            modalHide(hosters_modal_element, function () {
                                                                body.classList.remove('modal-open');
                                                            });
                                                            ShowErrorMessage(jlc_text_error, wrapper);
                                                            VanilaRemoveClasss(jlc_form_element, 'jlc-form__sending');
                                                            if (trackEvent) {
                                                                trackInstallError(jlc_hoster_domain, msg);
                                                            }
                                                        }
                                                    },
                                                    error: function (response) {
                                                        modalHide(hosters_modal_element, function () {
                                                            body.classList.remove('modal-open');
                                                        });
                                                        ShowErrorMessage(jlc_text_error, wrapper);
                                                        VanilaRemoveClasss(jlc_form_element, 'jlc-form__sending');
                                                        if (trackEvent) {
                                                            trackInstallError(jlc_hoster_domain, msg);
                                                        }
                                                    }
                                                });
                                            }

                                            const jlc_modal_form_email = CreateElement('input', {
                                                id: 'user_email',
                                                type: 'hidden',
                                                value: '',
                                                readonly: '',
                                            });
                                            jlc_modal_form.append(jlc_modal_form_email);

                                            const jlc_modal_form_grid = CreateElement('div', {
                                                className: 'hosters-grid'
                                            });
                                            jlc_modal_form.append(jlc_modal_form_grid);

                                            $.each(window.hosters, function (index, hoster) {
                                                
                                                if (!hoster.hasSignup) return;
                                                
                                                var jlc_modal_form_hoster = CreateElement('div', {
                                                    className: 'hoster'
                                                });
                                                jlc_modal_form_grid.append(jlc_modal_form_hoster);

                                                var jlc_modal_form_hoster_inner = CreateElement('div', {});
                                                jlc_modal_form_hoster.append(jlc_modal_form_hoster_inner);


                                                var atts = {
                                                    id: 'radio-' + hoster.keyword,
                                                    type: 'radio',
                                                    name: 'hoster',
                                                    value: hoster.keyword,
                                                    title: hoster.name,
                                                    'data-key': hoster.key,
                                                    'data-hoster-href': hoster.href,
                                                    'data-val': hoster.keyword,
                                                    'data-nm': hoster.name,
                                                    'data-lcn': hoster.region,
                                                    'data-custom-signup': '',
                                                    'data-site': '',
                                                    'data-id': '0',
                                                };
                                                if (index === 0) {
                                                    atts.checked = 'checked'
                                                }
                                                var jlc_modal_form_hoster_checkbox = CreateElement('input', atts);
                                                jlc_modal_form_hoster_inner.append(jlc_modal_form_hoster_checkbox);

                                                var jlc_modal_form_hoster_label = CreateElement('label', {
                                                    for: 'radio-' + hoster.keyword,
                                                });
                                                jlc_modal_form_hoster_inner.append(jlc_modal_form_hoster_label);

                                                var jlc_modal_form_hoster_link = CreateElement('a', {
                                                    href: '#',
                                                    className: 'show-info',
                                                    'data-hoster': hoster.keyword,
                                                    title: 'About ' + hoster.name
                                                }, "i");
                                                jlc_modal_form_hoster_label.append(jlc_modal_form_hoster_link);

                                                jlc_modal_form_hoster_link.addEventListener('click', function (e) {

                                                    var choosenHoster = this.getAttribute('data-hoster');
                                                    var oHoster = '';
                                                    $.each(window.hosters, function (index, hoster) {
                                                        if (hoster.keyword === choosenHoster) {
                                                            oHoster = hoster;
                                                        }
                                                    });

                                                    var info_modal = CreateElement('div', {
                                                        id: 'app-hoster-data',
                                                        className: 'hoster_data_modal',
                                                    });
                                                    body.append(info_modal);

                                                    info_modal.addEventListener('click', function (e) {
                                                        if (e.target === info_modal) {
                                                            modalHide(info_modal, function () {
                                                                info_modal.remove();
                                                            })
                                                        }
                                                    });

                                                    var info_modal_inner = CreateElement('div', {
                                                        className: 'modal-dialog',
                                                    });
                                                    info_modal.append(info_modal_inner);

                                                    var info_modal_content = CreateElement('div', {
                                                        className: 'modal-content',
                                                    });
                                                    info_modal_inner.append(info_modal_content);

                                                    var info_modal_title = CreateElement('span', {
                                                        className: 'jlc-modal--title',
                                                    }, oHoster.name);
                                                    info_modal_content.append(info_modal_title);

                                                    var info_modal_close = CreateElement('span', {
                                                        className: 'jlc-modal--close',
                                                    }, oHoster.name);
                                                    info_modal_title.append(info_modal_close);

                                                    info_modal_close.addEventListener('click', function (e) {
                                                        modalHide(info_modal, function () {
                                                            info_modal.remove();
                                                        });
                                                    });

                                                    var info_modal_data = CreateElement('div', {
                                                        id: oHoster.keyword + '-data',
                                                        className: 'hoster-details',
                                                    });
                                                    info_modal_content.append(info_modal_data);

                                                    var info_modal_row = CreateElement('div', {
                                                        className: 'h-row',
                                                    });
                                                    info_modal_data.append(info_modal_row);

                                                    var info_modal_row_left = CreateElement('div', {
                                                        className: 'left',
                                                    }, 'Support');
                                                    info_modal_row.append(info_modal_row_left);

                                                    var stars = '';
                                                    if (oHoster.support === 'new') {
                                                        stars = '<i class="ico ico--new"></i>';
                                                    } else {
                                                        var rating
                                                        if ((oHoster.support >= 1) && (oHoster.support <= 4)) {
                                                            rating = 1;
                                                        } else if ((oHoster.support >= 5) && (oHoster.support <= 9)) {
                                                            rating = 2;
                                                        } else if ((oHoster.support >= 10) && (oHoster.support <= 14)) {
                                                            rating = 3;
                                                        } else if ((oHoster.support >= 15) && (oHoster.support <= 17)) {
                                                            rating = 4;
                                                        }
                                                        if ((oHoster.support >= 18) && (oHoster.support <= 20)) {
                                                            rating = 5;
                                                        }
                                                        for (var j = 0; j < 5; j++) {
                                                            var filled = '';
                                                            (j < rating) ? filled = 'filled' : filled = ''
                                                            stars += '<i class="ico ico--stars ' + filled + '"></i>'
                                                        }
                                                    }
                                                    var info_modal_row_right = CreateElement('div', {
                                                        className: 'right',
                                                    });
                                                    info_modal_row.append(info_modal_row_right);
                                                    info_modal_row_right.insertAdjacentHTML('beforeEnd', stars);

                                                    info_modal_row = CreateElement('div', {
                                                        className: 'h-row',
                                                    });
                                                    info_modal_data.append(info_modal_row);

                                                    info_modal_row_left = CreateElement('div', {
                                                        className: 'left',
                                                    }, 'Perfomance');
                                                    info_modal_row.append(info_modal_row_left);

                                                    stars = '';
                                                    for (var i = 0; i < 5; i++) {
                                                        filled = '';
                                                        (i < Math.round(oHoster.performance)) ? filled = 'filled' : filled = ''
                                                        stars += '<i class="blue ico ico--stars ' + filled + '"></i>'
                                                    }

                                                    info_modal_row_right = CreateElement('div', {
                                                        className: 'right',
                                                    });
                                                    info_modal_row.append(info_modal_row_right);
                                                    info_modal_row_right.insertAdjacentHTML('beforeEnd', stars);

                                                    info_modal_row = CreateElement('div', {
                                                        className: 'h-row',
                                                    });
                                                    info_modal_data.append(info_modal_row);

                                                    info_modal_row_left = CreateElement('div', {
                                                        className: 'left',
                                                    }, 'Location');
                                                    info_modal_row.append(info_modal_row_left);

                                                    var countries = {
                                                        "GD": [
                                                            "Grenada"
                                                        ],
                                                        "GE": [
                                                            "Georgia"
                                                        ],
                                                        "GF": [
                                                            "French Guiana"
                                                        ],
                                                        "GA": [
                                                            "Gabon"
                                                        ],
                                                        "GB": [
                                                            "the United Kingdom",
                                                            "UK"
                                                        ],
                                                        "FK": [
                                                            "Falkland Islands (Malvinas)"
                                                        ],
                                                        "FJ": [
                                                            "Fiji"
                                                        ],
                                                        "FM": [
                                                            "Micronesia"
                                                        ],
                                                        "FI": [
                                                            "Finland"
                                                        ],
                                                        "FR": [
                                                            "France"
                                                        ],
                                                        "FO": [
                                                            "Faroe Islands"
                                                        ],
                                                        "GY": [
                                                            "Guyana"
                                                        ],
                                                        "GW": [
                                                            "Guinea-Bissau"
                                                        ],
                                                        "WS": [
                                                            "Samoa"
                                                        ],
                                                        "GN": [
                                                            "Guinea"
                                                        ],
                                                        "GM": [
                                                            "Gambia"
                                                        ],
                                                        "GL": [
                                                            "Greenland"
                                                        ],
                                                        "GI": [
                                                            "Gibraltar"
                                                        ],
                                                        "GH": [
                                                            "Ghana"
                                                        ],
                                                        "GG": [
                                                            "Guernsey"
                                                        ],
                                                        "GU": [
                                                            "Guam"
                                                        ],
                                                        "GT": [
                                                            "Guatemala"
                                                        ],
                                                        "GS": [
                                                            "South Georgia and the South Sandwich Islands"
                                                        ],
                                                        "GR": [
                                                            "Greece"
                                                        ],
                                                        "GQ": [
                                                            "Equatorial Guinea"
                                                        ],
                                                        "WF": [
                                                            "Wallis and Futuna"
                                                        ],
                                                        "GP": [
                                                            "Guadeloupe"
                                                        ],
                                                        "VI": [
                                                            "Virgin Islands"
                                                        ],
                                                        "DZ": [
                                                            "Algeria"
                                                        ],
                                                        "VG": [
                                                            "Virgin Islands"
                                                        ],
                                                        "VU": [
                                                            "Vanuatu"
                                                        ],
                                                        "VN": [
                                                            "Vietnam"
                                                        ],
                                                        "EC": [
                                                            "Ecuador"
                                                        ],
                                                        "DE": [
                                                            "Germany"
                                                        ],
                                                        "UZ": [
                                                            "Uzbekistan"
                                                        ],
                                                        "UY": [
                                                            "Uruguay"
                                                        ],
                                                        "DK": [
                                                            "Denmark"
                                                        ],
                                                        "DJ": [
                                                            "Djibouti"
                                                        ],
                                                        "VE": [
                                                            "Venezuela"
                                                        ],
                                                        "DM": [
                                                            "Dominica"
                                                        ],
                                                        "VC": [
                                                            "Saint Vincent and the Grenadines"
                                                        ],
                                                        "DO": [
                                                            "Dominican Republic"
                                                        ],
                                                        "VA": [
                                                            "Holy See (Vatican City State)"
                                                        ],
                                                        "EU": [
                                                            "Europe"
                                                        ],
                                                        "UG": [
                                                            "Uganda"
                                                        ],
                                                        "US": [
                                                            "the USA",
                                                            "North America"
                                                        ],
                                                        "UM": [
                                                            "United States Minor Outlying Islands"
                                                        ],
                                                        "EH": [
                                                            "Western Sahara"
                                                        ],
                                                        "EG": [
                                                            "Egypt"
                                                        ],
                                                        "TZ": [
                                                            "Tanzania"
                                                        ],
                                                        "EE": [
                                                            "Estonia"
                                                        ],
                                                        "TT": [
                                                            "Trinidad and Tobago"
                                                        ],
                                                        "TW": [
                                                            "Taiwan"
                                                        ],
                                                        "TV": [
                                                            "Tuvalu"
                                                        ],
                                                        "UA": [
                                                            "Ukraine"
                                                        ],
                                                        "ET": [
                                                            "Ethiopia"
                                                        ],
                                                        "ES": [
                                                            "Spain"
                                                        ],
                                                        "ER": [
                                                            "Eritrea"
                                                        ],
                                                        "TO": [
                                                            "Tonga"
                                                        ],
                                                        "TN": [
                                                            "Tunisia"
                                                        ],
                                                        "TM": [
                                                            "Turkmenistan"
                                                        ],
                                                        "TL": [
                                                            "Timor-Leste"
                                                        ],
                                                        "CA": [
                                                            "Canada"
                                                        ],
                                                        "TR": [
                                                            "Turkey"
                                                        ],
                                                        "BZ": [
                                                            "Belize"
                                                        ],
                                                        "TG": [
                                                            "Togo"
                                                        ],
                                                        "BW": [
                                                            "Botswana"
                                                        ],
                                                        "TF": [
                                                            "French Southern Territories"
                                                        ],
                                                        "BV": [
                                                            "Bouvet Island"
                                                        ],
                                                        "BY": [
                                                            "Belarus"
                                                        ],
                                                        "TD": [
                                                            "Chad"
                                                        ],
                                                        "TK": [
                                                            "Tokelau"
                                                        ],
                                                        "BS": [
                                                            "Bahamas"
                                                        ],
                                                        "TJ": [
                                                            "Tajikistan"
                                                        ],
                                                        "BR": [
                                                            "Brazil"
                                                        ],
                                                        "TH": [
                                                            "Thailand"
                                                        ],
                                                        "BT": [
                                                            "Bhutan"
                                                        ],
                                                        "BN": [
                                                            "Brunei Darussalam"
                                                        ],
                                                        "BO": [
                                                            "Bolivia"
                                                        ],
                                                        "BQ": [
                                                            "Bonaire"
                                                        ],
                                                        "BJ": [
                                                            "Benin"
                                                        ],
                                                        "TC": [
                                                            "Turks and Caicos Islands"
                                                        ],
                                                        "BL": [
                                                            "Saint Bartelemey"
                                                        ],
                                                        "BM": [
                                                            "Bermuda"
                                                        ],
                                                        "BF": [
                                                            "Burkina Faso"
                                                        ],
                                                        "SV": [
                                                            "El Salvador"
                                                        ],
                                                        "BG": [
                                                            "Bulgaria"
                                                        ],
                                                        "SS": [
                                                            "South Sudan"
                                                        ],
                                                        "BH": [
                                                            "Bahrain"
                                                        ],
                                                        "ST": [
                                                            "Sao Tome and Principe"
                                                        ],
                                                        "BI": [
                                                            "Burundi"
                                                        ],
                                                        "SY": [
                                                            "Syrian Arab Republic"
                                                        ],
                                                        "BB": [
                                                            "Barbados"
                                                        ],
                                                        "SZ": [
                                                            "Swaziland"
                                                        ],
                                                        "BD": [
                                                            "Bangladesh"
                                                        ],
                                                        "SX": [
                                                            "Sint Maarten"
                                                        ],
                                                        "BE": [
                                                            "Belgium"
                                                        ],
                                                        "SL": [
                                                            "Sierra Leone"
                                                        ],
                                                        "SK": [
                                                            "Slovakia"
                                                        ],
                                                        "SN": [
                                                            "Senegal"
                                                        ],
                                                        "SM": [
                                                            "San Marino"
                                                        ],
                                                        "SO": [
                                                            "Somalia"
                                                        ],
                                                        "SR": [
                                                            "Suriname"
                                                        ],
                                                        "SD": [
                                                            "Sudan"
                                                        ],
                                                        "CZ": [
                                                            "Czech Republic"
                                                        ],
                                                        "SC": [
                                                            "Seychelles"
                                                        ],
                                                        "CY": [
                                                            "Cyprus"
                                                        ],
                                                        "CX": [
                                                            "Christmas Island"
                                                        ],
                                                        "SE": [
                                                            "Sweden"
                                                        ],
                                                        "CW": [
                                                            "Curacao"
                                                        ],
                                                        "SH": [
                                                            "Saint Helena"
                                                        ],
                                                        "CV": [
                                                            "Cape Verde"
                                                        ],
                                                        "SG": [
                                                            "Singapore"
                                                        ],
                                                        "CU": [
                                                            "Cuba"
                                                        ],
                                                        "SJ": [
                                                            "Svalbard and Jan Mayen"
                                                        ],
                                                        "SI": [
                                                            "Slovenia"
                                                        ],
                                                        "CR": [
                                                            "Costa Rica"
                                                        ],
                                                        "CO": [
                                                            "Colombia"
                                                        ],
                                                        "CM": [
                                                            "Cameroon"
                                                        ],
                                                        "CN": [
                                                            "China"
                                                        ],
                                                        "SA": [
                                                            "Saudi Arabia"
                                                        ],
                                                        "CK": [
                                                            "Cook Islands"
                                                        ],
                                                        "SB": [
                                                            "Solomon Islands"
                                                        ],
                                                        "CL": [
                                                            "Chile"
                                                        ],
                                                        "CI": [
                                                            "Cote d'Ivoire"
                                                        ],
                                                        "RS": [
                                                            "Serbia"
                                                        ],
                                                        "CG": [
                                                            "Congo"
                                                        ],
                                                        "RU": [
                                                            "Russian Federation"
                                                        ],
                                                        "CH": [
                                                            "Switzerland"
                                                        ],
                                                        "RW": [
                                                            "Rwanda"
                                                        ],
                                                        "CF": [
                                                            "Central African Republic"
                                                        ],
                                                        "CC": [
                                                            "Cocos (Keeling) Islands"
                                                        ],
                                                        "CD": [
                                                            "Congo"
                                                        ],
                                                        "RO": [
                                                            "Romania"
                                                        ],
                                                        "RE": [
                                                            "Reunion"
                                                        ],
                                                        "AZ": [
                                                            "Azerbaijan"
                                                        ],
                                                        "BA": [
                                                            "Bosnia and Herzegovina"
                                                        ],
                                                        "AT": [
                                                            "Austria"
                                                        ],
                                                        "AS": [
                                                            "American Samoa"
                                                        ],
                                                        "AR": [
                                                            "Argentina"
                                                        ],
                                                        "AQ": [
                                                            "Antarctica"
                                                        ],
                                                        "AX": [
                                                            "Aland Islands"
                                                        ],
                                                        "AW": [
                                                            "Aruba"
                                                        ],
                                                        "QA": [
                                                            "Qatar"
                                                        ],
                                                        "AU": [
                                                            "Australia"
                                                        ],
                                                        "AL": [
                                                            "Albania"
                                                        ],
                                                        "AI": [
                                                            "Anguilla"
                                                        ],
                                                        "AO": [
                                                            "Angola"
                                                        ],
                                                        "AP": [
                                                            "Asia/Pacific Region"
                                                        ],
                                                        "PY": [
                                                            "Paraguay"
                                                        ],
                                                        "AM": [
                                                            "Armenia"
                                                        ],
                                                        "PT": [
                                                            "Portugal"
                                                        ],
                                                        "AD": [
                                                            "Andorra"
                                                        ],
                                                        "PW": [
                                                            "Palau"
                                                        ],
                                                        "AG": [
                                                            "Antigua and Barbuda"
                                                        ],
                                                        "AE": [
                                                            "United Arab Emirates"
                                                        ],
                                                        "PR": [
                                                            "Puerto Rico"
                                                        ],
                                                        "AF": [
                                                            "Afghanistan"
                                                        ],
                                                        "PS": [
                                                            "Palestinian Territory"
                                                        ],
                                                        "NU": [
                                                            "Niue"
                                                        ],
                                                        "NR": [
                                                            "Nauru"
                                                        ],
                                                        "NP": [
                                                            "Nepal"
                                                        ],
                                                        "NO": [
                                                            "Norway"
                                                        ],
                                                        "NZ": [
                                                            "New Zealand"
                                                        ],
                                                        "OM": [
                                                            "Oman"
                                                        ],
                                                        "PE": [
                                                            "Peru"
                                                        ],
                                                        "PF": [
                                                            "French Polynesia"
                                                        ],
                                                        "PG": [
                                                            "Papua New Guinea"
                                                        ],
                                                        "PA": [
                                                            "Panama"
                                                        ],
                                                        "PL": [
                                                            "Poland"
                                                        ],
                                                        "PM": [
                                                            "Saint Pierre and Miquelon"
                                                        ],
                                                        "PN": [
                                                            "Pitcairn"
                                                        ],
                                                        "PH": [
                                                            "Philippines"
                                                        ],
                                                        "PK": [
                                                            "Pakistan"
                                                        ],
                                                        "LS": [
                                                            "Lesotho"
                                                        ],
                                                        "LR": [
                                                            "Liberia"
                                                        ],
                                                        "LV": [
                                                            "Latvia"
                                                        ],
                                                        "LU": [
                                                            "Luxembourg"
                                                        ],
                                                        "LT": [
                                                            "Lithuania"
                                                        ],
                                                        "LY": [
                                                            "Libyan Arab Jamahiriya"
                                                        ],
                                                        "MC": [
                                                            "Monaco"
                                                        ],
                                                        "MD": [
                                                            "Moldova"
                                                        ],
                                                        "MA": [
                                                            "Morocco"
                                                        ],
                                                        "A1": [
                                                            "Anonymous Proxy"
                                                        ],
                                                        "MG": [
                                                            "Madagascar"
                                                        ],
                                                        "A2": [
                                                            "Satellite Provider"
                                                        ],
                                                        "MH": [
                                                            "Marshall Islands"
                                                        ],
                                                        "ME": [
                                                            "Montenegro"
                                                        ],
                                                        "MF": [
                                                            "Saint Martin"
                                                        ],
                                                        "MK": [
                                                            "Macedonia"
                                                        ],
                                                        "ML": [
                                                            "Mali"
                                                        ],
                                                        "MN": [
                                                            "Mongolia"
                                                        ],
                                                        "MM": [
                                                            "Myanmar"
                                                        ],
                                                        "MP": [
                                                            "Northern Mariana Islands"
                                                        ],
                                                        "O1": [
                                                            "Other Country"
                                                        ],
                                                        "MO": [
                                                            "Macao"
                                                        ],
                                                        "MR": [
                                                            "Mauritania"
                                                        ],
                                                        "MQ": [
                                                            "Martinique"
                                                        ],
                                                        "MT": [
                                                            "Malta"
                                                        ],
                                                        "MS": [
                                                            "Montserrat"
                                                        ],
                                                        "MV": [
                                                            "Maldives"
                                                        ],
                                                        "MU": [
                                                            "Mauritius"
                                                        ],
                                                        "MX": [
                                                            "Mexico"
                                                        ],
                                                        "MW": [
                                                            "Malawi"
                                                        ],
                                                        "MZ": [
                                                            "Mozambique"
                                                        ],
                                                        "MY": [
                                                            "Malaysia"
                                                        ],
                                                        "NA": [
                                                            "Namibia"
                                                        ],
                                                        "NC": [
                                                            "New Caledonia"
                                                        ],
                                                        "NE": [
                                                            "Niger"
                                                        ],
                                                        "NF": [
                                                            "Norfolk Island"
                                                        ],
                                                        "NG": [
                                                            "Nigeria"
                                                        ],
                                                        "NI": [
                                                            "Nicaragua"
                                                        ],
                                                        "NL": [
                                                            "the Netherlands",
                                                            "Holland"
                                                        ],
                                                        "JP": [
                                                            "Japan"
                                                        ],
                                                        "JO": [
                                                            "Jordan"
                                                        ],
                                                        "JM": [
                                                            "Jamaica"
                                                        ],
                                                        "KI": [
                                                            "Kiribati"
                                                        ],
                                                        "KH": [
                                                            "Cambodia"
                                                        ],
                                                        "KG": [
                                                            "Kyrgyzstan"
                                                        ],
                                                        "KE": [
                                                            "Kenya"
                                                        ],
                                                        "KW": [
                                                            "Kuwait"
                                                        ],
                                                        "KY": [
                                                            "Cayman Islands"
                                                        ],
                                                        "KZ": [
                                                            "Kazakhstan"
                                                        ],
                                                        "KP": [
                                                            "Korea"
                                                        ],
                                                        "KR": [
                                                            "Korea"
                                                        ],
                                                        "KM": [
                                                            "Comoros"
                                                        ],
                                                        "KN": [
                                                            "Saint Kitts and Nevis"
                                                        ],
                                                        "LI": [
                                                            "Liechtenstein"
                                                        ],
                                                        "LK": [
                                                            "Sri Lanka"
                                                        ],
                                                        "LA": [
                                                            "Lao People's Democratic Republic"
                                                        ],
                                                        "LC": [
                                                            "Saint Lucia"
                                                        ],
                                                        "LB": [
                                                            "Lebanon"
                                                        ],
                                                        "HR": [
                                                            "Croatia"
                                                        ],
                                                        "HT": [
                                                            "Haiti"
                                                        ],
                                                        "HU": [
                                                            "Hungary"
                                                        ],
                                                        "HK": [
                                                            "Hong Kong"
                                                        ],
                                                        "ZA": [
                                                            "South Africa"
                                                        ],
                                                        "HN": [
                                                            "Honduras"
                                                        ],
                                                        "HM": [
                                                            "Heard Island and McDonald Islands"
                                                        ],
                                                        "ZW": [
                                                            "Zimbabwe"
                                                        ],
                                                        "ID": [
                                                            "Indonesia"
                                                        ],
                                                        "IE": [
                                                            "Ireland"
                                                        ],
                                                        "ZM": [
                                                            "Zambia"
                                                        ],
                                                        "IQ": [
                                                            "Iraq"
                                                        ],
                                                        "IR": [
                                                            "Iran"
                                                        ],
                                                        "YE": [
                                                            "Yemen"
                                                        ],
                                                        "IS": [
                                                            "Iceland"
                                                        ],
                                                        "IT": [
                                                            "Italy"
                                                        ],
                                                        "IL": [
                                                            "Israel"
                                                        ],
                                                        "IM": [
                                                            "Isle of Man"
                                                        ],
                                                        "IN": [
                                                            "India"
                                                        ],
                                                        "IO": [
                                                            "British Indian Ocean Territory"
                                                        ],
                                                        "JE": [
                                                            "Jersey"
                                                        ],
                                                        "YT": [
                                                            "Mayotte"
                                                        ]
                                                    };
                                                    var location = {
                                                        "US": {
                                                            "LA": "Los Angeles",
                                                            "CH": "Chicago",
                                                            "TX": "Texas",
                                                            "GA": "Georgia",
                                                            "NJ": "New Jersey",
                                                            "NY": "New York",
                                                            "NY1": "New York 1",
                                                            "NY2": "New York 2"
                                                        },
                                                        "FI": {
                                                            "HE": "Helsinki",
                                                            "ES": "Espoo"
                                                        },
                                                        "CH": {
                                                            "ATT": "Attinghausen",
                                                            "ZU": "Zurich",
                                                            "BN": "Bern",
                                                            "GG": "Gland - Geneva",
                                                            "GN1": "Geneva 1",
                                                            "GN2": "Geneva 2"
                                                        },
                                                        "BR": {
                                                            "CMP": "Campinas",
                                                            "NOR": "Nordeste",
                                                            "SP": "São Paulo"
                                                        },
                                                        "BE": {
                                                            "NL": "datacenter in the Netherlands"
                                                        },
                                                        "IN": {
                                                            "PU": "Pune"
                                                        },
                                                        "IL": {
                                                            "RH": "Rosh Haayin",
                                                            "JF": "Jaffa"
                                                        },
                                                        "NL": {
                                                            "MP": "Meppel",
                                                            "DT": "Dronten",
                                                            "AM": "Amsterdam",
                                                            "HW": "Hengelo West",
                                                            "HS": "Hengelo South"
                                                        },
                                                        "SE": {
                                                            "SH1": "Stockholm North",
                                                            "SH2": "Stockholm South",
                                                            "SH3": "Stockholm West"
                                                        },
                                                        "SA": {
                                                            "JD": "Jeddah",
                                                            "RD": "Riyadh",
                                                            "KH": "Khobar"
                                                        },
                                                        "GB": {
                                                            "LND": "London",
                                                            "LND1": "London 1",
                                                            "LND2": "London 2"
                                                        },
                                                        "DE": {
                                                            "FR": "Frankfurt"
                                                        },
                                                        "RU": {
                                                            "MO": "Moscow"
                                                        },
                                                        "FR": {
                                                            "AP": "Aix-en-Provence"
                                                        }
                                                    };

                                                    var regions = '';
                                                    if (Object.keys(oHoster.performanceRegions).length) {
                                                        $.each(oHoster.performanceRegions, function (code, stars) {
                                                            var codes = code.split('-');
                                                            var additional = codes[1];
                                                            var code = codes[0];
                                                            regions += '<p>' +
                                                                '<i class="flag flag-' + code.toLowerCase() + '"></i>' +
                                                                '<span class="right-part">' +
                                                                '<span class="location-rating">' + Math.round(stars) + '</span>' +
                                                                '<span class="location-country">' + countries[code][0];
                                                            if (additional) {
                                                                regions += '<span class="location-additional">(' + location[code][additional] + ')</span>';
                                                            }
                                                            regions += '</span>' +
                                                                '</span>' +
                                                                '</p>';
                                                        });
                                                    } else {
                                                        regions += '<p>' +
                                                            '<i class="flag flag-' + oHoster.countryCode.toLowerCase() + '"></i>' +
                                                            '<span class="right-part">' +
                                                            '<span class="location-country">' + oHoster.region + '</span>' +
                                                            '</span>' +
                                                            '</p>';
                                                    }

                                                    info_modal_row_right = CreateElement('div', {
                                                        className: 'right regions-row',
                                                    });
                                                    info_modal_row.append(info_modal_row_right);
                                                    info_modal_row_right.insertAdjacentHTML('beforeEnd', regions);

                                                    info_modal_row = CreateElement('div', {
                                                        className: 'h-row',
                                                    });
                                                    info_modal_data.append(info_modal_row);

                                                    info_modal_row_left = CreateElement('div', {
                                                        className: 'left',
                                                    }, 'Location');
                                                    info_modal_row.append(info_modal_row_left);

                                                    info_modal_row_right = CreateElement('div', {
                                                        className: 'right',
                                                    }, oHoster.version);
                                                    info_modal_row.append(info_modal_row_right);

                                                    info_modal_row = CreateElement('div', {
                                                        className: 'h-row',
                                                    });
                                                    info_modal_data.append(info_modal_row);

                                                    info_modal_row_left = CreateElement('div', {
                                                        className: 'left',
                                                    });
                                                    info_modal_row.append(info_modal_row_left);
                                                    info_modal_row_left.insertAdjacentHTML('beforeEnd', '<a href="https://jelastic.cloud/details/' + oHoster.keyword + '" target="_blank">Read more</a>');


                                                    modalShow(info_modal);

                                                });

                                                var jlc_modal_form_hoster_logo_wrapper = CreateElement('span', {
                                                    className: 'logo-wrapper',
                                                });
                                                jlc_modal_form_hoster_label.append(jlc_modal_form_hoster_logo_wrapper);

                                                var jlc_modal_form_hoster_logo = CreateElement('img', {
                                                    src: '//jelastic.com/wp-content/themes/salient/img/hosters/hosters_signin/' + hoster.keyword + '.png',
                                                    alt: hoster.name
                                                });
                                                jlc_modal_form_hoster_logo_wrapper.append(jlc_modal_form_hoster_logo);

                                                var jlc_modal_form_hoster_region = CreateElement('span', {
                                                    className: "hoster-regions"
                                                });
                                                jlc_modal_form_hoster_label.append(jlc_modal_form_hoster_region);


                                                delete hoster.performanceRegions.general;
                                                if (Object.keys(hoster.performanceRegions).length) {
                                                    var out = [],
                                                        j = 0;

                                                    $.each(hoster.performanceRegions, function (code, stars) {
                                                        var codes = code.split('-'),
                                                            code = codes[0],
                                                            flag = out.indexOf(code);
                                                        if (flag < 0) {
                                                            out[j] = code;
                                                            j++;
                                                        }
                                                    });

                                                    $.each(out, function (index, code) {
                                                        var jlc_modal_form_hoster_flag = CreateElement('i', {
                                                            className: "flag flag-" + code.toLowerCase()
                                                        }, code.toLowerCase());
                                                        jlc_modal_form_hoster_region.append(jlc_modal_form_hoster_flag);
                                                    });


                                                } else {
                                                    var jlc_modal_form_hoster_flag = CreateElement('i', {
                                                        className: "flag flag-" + hoster.countryCode.toLowerCase()
                                                    }, hoster.countryCode.toLowerCase());
                                                    jlc_modal_form_hoster_region.append(jlc_modal_form_hoster_flag);
                                                }
                                            });


                                            const jlc_modal_form_line = CreateElement('div', {
                                                className: 'gradient-line'
                                            });
                                            jlc_modal_form.append(jlc_modal_form_line);

                                            const jlc_modal_form_checkbox = CreateElement('div', {
                                                className: 'jlc-gdpr--checkbox'
                                            });
                                            jlc_modal_form.append(jlc_modal_form_checkbox);


                                            const jlc_modal_form_checkbox_label = CreateElement('label', {});
                                            jlc_modal_form_checkbox.append(jlc_modal_form_checkbox_label);

                                            const jlc_modal_form_checkbox_input = CreateElement('input', {
                                                type: 'checkbox'
                                            });
                                            jlc_modal_form_checkbox_label.append(jlc_modal_form_checkbox_input);


                                            const jlc_modal_form_checkbox_span = CreateElement('span', {});
                                            jlc_modal_form_checkbox_label.append(jlc_modal_form_checkbox_span);
                                            jlc_modal_form_checkbox_span.insertAdjacentHTML('beforeEnd', "I read and agree to <a href=\"https://jelastic.com/terms/\" target='_blank'>Jelastic Terms of Use </a>and <a href=\"https://jelastic.com/policy/\" target='_blank'>Privacy Policy</a>");

                                            const jlc_modal_form_checkbox_required = CreateElement('span', {
                                                className: 'gfield_required'
                                            }, '*');
                                            jlc_modal_form_checkbox_span.append(jlc_modal_form_checkbox_required);

                                            const jlc_modal_form_submit = CreateElement('input', {
                                                className: 'jlc-form--submit submit-disabled',
                                                value: 'Install',
                                                type: 'submit',
                                                disabled: ''
                                            }, '*');
                                            jlc_modal_form.append(jlc_modal_form_submit);

                                            jlc_modal_form_checkbox_input.addEventListener('change', function (e) {

                                                if (this.checked) {
                                                    jlc_modal_form_submit.removeAttribute('disabled');
                                                    jlc_modal_form_submit.classList.remove('submit-disabled');
                                                } else {
                                                    jlc_modal_form_submit.setAttribute('disabled', 'disabled');
                                                    jlc_modal_form_submit.classList.add('submit-disabled');
                                                }
                                            });


                                        },
                                        error: function (jqXHR, textStatus, errorThrown) {

                                        }
                                    });
                                }
                            }
                        }
                    );
                })();
            }
        }
    });
}());
