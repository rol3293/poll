import React from "react";
import {Button, Container, Menu, Message} from "semantic-ui-react";
import Head from "next/head";
import Link from "next/link";
import "semantic-ui-css/semantic.min.css";
import web3 from "../ethereum/web3";

class Layout extends React.Component {
    state = {
        account: '',
        networkId: 4
    }

    async componentDidMount() {
        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();
        this.setState({account: accounts[0], networkId})

        window.ethereum.on('accountsChanged', (accounts) => {
            this.setState({account: accounts[0]});
        });

        window.ethereum.on('chainChanged', (networkId) => {
            this.setState({networkId: networkId * 1});
        });
    }

    onSwitchNetwork = async () => {
        await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x4'}]
        });
    }

    render() {
        const {account} = this.state;

        return (
            <Container style={{maximumWidth: '70%'}}>
                <Head>
                    <title>Poll Generator</title>
                </Head>

                <Message
                    color='red'
                    hidden={this.state.networkId === 4}
                >
                    You are connected to the wrong network
                    <Button
                        color='red'
                        size='mini'
                        style={{marginLeft: '5px'}}
                        onClick={this.onSwitchNetwork}
                    >Switch to Rinkeby</Button>
                </Message>
                <Menu primary style={{ marginTop: '10px' }}>
                    <Link href="/">
                        <Menu.Item
                            name='Home'
                        />
                    </Link>

                    <Link href="/vote/create">
                        <Menu.Item
                            name='Create'
                        />
                    </Link>

                    <Link href="/myPolls">
                        <Menu.Item
                            disabled={!web3}
                            name='My polls'
                        />
                    </Link>

                    <Link href="/verify">
                        <Menu.Item
                            name='Verify'
                        />
                    </Link>

                    <Menu.Menu position='right'>
                        <Menu.Item>
                            0x{(account.slice(2,5) + '...' + account.slice(38, 42)).toUpperCase()}
                        </Menu.Item>
                    </Menu.Menu>

                </Menu>
                {this.props.children}
            </Container>
        );
    }

    componentWillUnmount() {
        window.ethereum.removeAllListeners();
    }

}

export default Layout;
