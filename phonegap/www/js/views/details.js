(function (FMS, Backbone, _, $) {
    _.extend( FMS, {
        DetailsView: FMS.FMSView.extend({
            template: 'details',
            id: 'details-page',
            prev: 'photo',
            next: 'submit-start',

            events: {
                'pagehide': 'destroy',
                'pageshow': 'afterDisplay',
                'click .ui-btn-left': 'onClickButtonPrev',
                'click .ui-btn-right': 'onClickButtonNext',
                'blur textarea': 'updateCurrentReport',
                'change select': 'updateCurrentReport',
                'blur input': 'updateCurrentReport'
            },

            afterRender: function() {
                if ( this.model.get('category') ) {
                    this.$('#form_category').val( this.model.get('category') );
                }

                this.$('#form_category')
                    .attr('data-role', 'none')
                    .addClass('noselection');
            },

            onClickButtonPrev: function() {
                this.updateCurrentReport();
                this.navigate( this.prev );
            },

            onClickButtonNext: function() {
                this.clearValidationErrors();
                var valid = 1;

                if ( !$('#form_title').val() ) {
                    valid = 0;
                    this.validationError( 'form_title', FMS.validationStrings.title );
                }

                if ( !$('#form_detail').val() ) {
                    valid = 0;
                    this.validationError( 'form_detail', FMS.validationStrings.detail );
                }

                var cat = $('#form_category').val();
                if ( cat == '-- Pick a category --' ) {
                    valid = 0;
                    this.validationError( 'form_category', FMS.validationStrings.category );
                }

                if ( valid ) {
                    this.clearValidationErrors();
                    this.updateCurrentReport();
                    if ( FMS.isOffline ) {
                        this.navigate( 'save_offline' );
                    } else {
                        this.navigate( this.next );
                    }
                }
            },

            updateCurrentReport: function() {
                if ( $('#form_category').val() && $('#form_title').val() && $('#form_detail').val() ) {
                    $('#next').addClass('page_complete_btn');
                } else {
                    $('#next').removeClass('page_complete_btn');
                }
                this.model.set('category', $('#form_category').val());
                this.model.set('title', $('#form_title').val());
                this.model.set('details', $('#form_detail').val());
                FMS.saveCurrentDraft();
            }
        })
    });
})(FMS, Backbone, _, $);