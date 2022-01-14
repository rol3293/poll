import React from "react";
import Layout from "../components/Layout";
import {Button, Message} from "semantic-ui-react";
import web3 from "../ethereum/web3";
import factory from "../ethereum/factory";

class Verify extends React.Component {
    state = {
        error: false,
        loading: false,
        verified: true,
        message: ''
    }

    onCheckIsVerified = async (event) => {
        const [account] = await web3.eth.getAccounts();

        this.setState({loading: true, message: ''});
        const isVerified = await factory.methods.voters(account).call();
        this.setState({loading:false, verified: isVerified});

        if (!isVerified) {
            this.setState({message: 'Your wallet is not verified!'});
        } else {
            this.setState({message: 'Your wallet is verified!'});
        }
    }

    onVerify = async () => {
        const [account] = await web3.eth.getAccounts();

        this.setState({loading: true, error: false, message: ''});

        try {
            await factory.methods.verify().send({
                from: account,
                value: web3.utils.toWei('0.001', 'ether')
            });
            this.setState({verified: true});
        } catch (err) {
            this.setState({error: true, message: err.message});
        }

        this.setState({loading: false});
    }

    render() {
        const {loading, error, verified, message} = this.state;
        return (
            <Layout>
                <h2>Verify your wallet</h2>
                <Button
                    primary
                    loading={loading}
                    disabled={loading}
                    onClick={verified ? this.onCheckIsVerified : this.onVerify}
                >{verified ? 'Check if this wallet is verified' : 'Verify'}</Button>
                <Message error={error} content={message} hidden={!message} />
            </Layout>
        );
    }
}

export default Verify;
