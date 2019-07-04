import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Loading, Owner, IssueList, Filter, Pages, PageButton } from './style';
import Container from '../../Components/Container';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    page: 1,
    state: 'open',
  };

  async componentDidMount() {
    this.load();
  }

  handleChange = async e => {
    await this.setState({ page: 1, loading: true });
    this.load(1, e.state.value);
  };

  handlePages = async next => {
    const { page } = this.state;
    if (next) {
      await this.setState({ page: page + 1, loading: true });
      this.load();
    } else {
      await this.setState({ page: page - 1, loading: true });
      this.load();
    }
  };

  load = async () => {
    const { match } = this.props;

    const { page, state } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: { state, per_page: 30, page },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
      state,
    });
  };

  render() {
    const { repository, issues, loading, page } = this.state;
    if (loading) {
      return <Loading>Carregando</Loading>;
    }
    return (
      <Container>
        <Owner>
          <Link to="/">Voltar para os repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
          <Filter onChange={this.handleChange}>
            <option value="all">Filter State</option>
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </Filter>
        </Owner>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <Pages>
          {page > 1 && (
            <PageButton onClick={() => this.handlePages(false)}>
              Previous
            </PageButton>
          )}
          <PageButton onClick={() => this.handlePages(true)}>Next</PageButton>
        </Pages>
      </Container>
    );
  }
}
