import React from "react";
import Layout from "../components/Layout";
import factory from "../ethereum/factory";
import Poll from "../ethereum/poll";
import { Card, Loader } from "semantic-ui-react";
import web3 from "../ethereum/web3";

class Index extends React.Component {
    state = {
        loading: true,
        items: []
    }

    async componentDidMount() {
        const polls = await factory.methods.getDeployedPolls().call();

        const items = [];
        for (const e of polls) {
            const poll = Poll(e);
            const summary = await poll.methods.getSummary().call();
            const title = summary[1];
            const description = summary[2];
            const paused = summary[3];
            const closed = summary[4];
            const winner = summary[5];
            const options = summary[6];
            const votes = summary[7];
            let totalVotes = 0;
            votes.map((value, index) => {
                totalVotes += parseInt(value);
            });
            items.push(
                {
                    href: `/vote/${e}`,
                    header: title,
                    description: `Options: ${[...options]}`,
                    meta: 'total votes: ' + totalVotes,
                    color: paused ? 'red' : 'blue'
                }
            );
        }
        this.setState({ items, loading: false });
    }

    render() {
        const { items, loading } = this.state;
        return (
            <Layout>
                <h2>
                    Welcome to the ethereum poll generator!
                </h2>
                <h3>View polls</h3>
                <Loader active={loading} inline='centered' />
                <div hidden={loading}>
                    Total polls deployed: {items.length}
                </div>
                <br />
                <Card.Group items={items} />
            </Layout>
        );
    }
}

export default Index;
