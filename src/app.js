import $ from 'cash-dom';

import github from './api/github';
import './assets/scss/app.scss';

export class App {
  initializeApp() {
    const self = this;

    $('.load-username').on('click', function() {
      const userName = $('.username.input').val();


      if (self.validate(userName)) {
        $('.username.input').removeClass('is-danger');
        self.fetchUser(userName).then(() => {
          self.update_profile();
        }).catch(() => {
          self.handleInputError('.username.input');
        });

      } else {
        self.handleInputError('.username.input');
      }

    })
  }

  async fetchUser(userName) {
    const response = await github.get(`users/${userName}`);
    this.profile = response.data;
  };

  handleInputError(input) {
    $(input).addClass('is-danger');
  }

  validate(string) {
    const pattern = /^[a-z0-9\_\-]+$/;
    return pattern.test(string);
  }


  update_profile() {
    $('#profile-name').text($('.username.input').val())
    $('#profile-image').attr('src', this.profile.avatar_url || 'http://placekitten.com/200/200')
    $('#profile-url').attr('href', this.profile.html_url || '#').text(this.profile.login)
    $('#profile-bio').text(this.profile.bio || '(no information)')
  }
}
