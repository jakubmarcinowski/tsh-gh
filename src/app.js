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
        self.handleLoading(false);
        self.fetchUser(userName).then(() => {
          self.update_profile();
          self.fetchHistory(userName).then(() => {
            self.update_history();
            self.handleLoading(true);
          });
        }).catch(() => {
          self.handleInputError('.username.input');
        })
      } else {
        self.handleInputError('.username.input');
      }

    })
  };

  async fetchUser(userName) {
    const response = await github.get(`users/${userName}`);
    this.profile = response.data;
  };

  async fetchHistory(userName) {
    const response = await github.get(`users/${userName}/events/public`);
    const types = ['PullRequestEvent', 'PullRequestReviewCommentEvent'];
    const history = response.data.filter((element) => types.includes(element.type) ? element : null);
    this.history = history;
  };

  handleInputError(input) {
    $(input).addClass('is-danger');
  };

  handleLoading(active) {
    if (active) {
      $('.loader').addClass('is-hidden');
      $('.profile').removeClass('is-hidden');
      $('.timeline').removeClass('is-hidden');
    } else {
      $('.loader').removeClass('is-hidden');
      $('.profile').addClass('is-hidden');
      $('.timeline').addClass('is-hidden');
    }
  }

  formatDate(timestamp) {
    const date = new Date(timestamp);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();

  };

  validate(string) {
    const pattern = /^[a-z0-9\_\-]+$/;
    return pattern.test(string);
  };

  update_history() {
    const historyHTML = this.history.map(({ type, actor, repo, payload }) => {
      let helper = false;
      if (type === 'PullRequestEvent') {
        helper = true;
      }
      const data = payload[Object.keys(payload)[helper ? 2 : 1]];
      const date = this.formatDate(data.created_at);
      return `<div class="timeline-item ${ helper ? 'is-primary' : ''}">
                <div class="timeline-marker ${ helper ? 'is-primary' : ''}"></div>
                <div class="timeline-content">
                  <p class="heading">${date}</p>
                  <div class="content">
                    <span class="gh-username">
                      <img src='${actor.avatar_url}' />
                      <a href="https://github.com/${actor.display_login}">${actor.login}</a>
                    </span>
                    <span>${payload.action}</span>
                    ${ helper ?
                      `<a href="${data.html_url}">pull request</a>`
                      :
                      `<a href="${data.html_url}">comment</a>
                      <span>to</span>
                      <a href="${data.url}">pull request</a>` 
                    }
                    <p class="repo-name">
                      <a href="https://github.com/${repo.name}">${repo.name}</a>
                    </p>
                  </div>
                </div>
              </div>`;
    });
    $('#user-timeline').html(historyHTML.join(''));
  }



  update_profile() {
    $('#profile-name').text($('.username.input').val())
    $('#profile-image').attr('src', this.profile.avatar_url || 'http://placekitten.com/200/200')
    $('#profile-url').attr('href', this.profile.html_url || '#').text(this.profile.login)
    $('#profile-bio').text(this.profile.bio || '(no information)')
  };
}
