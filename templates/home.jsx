// NOTE: This is really just a loading screen, so we have something to show
// on / whilst the lists sub is loading. Not sure if Home is the correct name.
Home = React.createClass({
  render: function() {
    return (
      <div className="page lists-show">
        <div className="content-scrollable list-items">
          <div className="wrapper-message">
            <div className="title-message">Loading app...</div>
          </div>
        </div>
      </div>
    )
  }
});