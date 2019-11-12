import $ from 'cash-dom';

import github from './api/github';
import './assets/scss/app.scss';

export class App {
  initializeApp() {
    const self = this;

    $('.load-username').on('click', function() {
      const userName = $('.username.input').val();

      self.fetchUser(userName).then(() => {
        self.update_profile();
      })

    })
  }

  async fetchUser(userName) {
    const response = await github.get(`users/${userName}`);
    this.profile = response.data;
  };




  update_profile() {
    $('#profile-name').text($('.username.input').val())
    $('#profile-image').attr('src', this.profile.avatar_url || 'http://placekitten.com/200/200')
    $('#profile-url').attr('href', this.profile.html_url || '#').text(this.profile.login)
    $('#profile-bio').text(this.profile.bio || '(no information)')
  }
}
