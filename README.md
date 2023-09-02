![OSSB Logo](OSSBHeader.JPG)
# OSSB 
(tentative title meaning Open Source Software Bounties)

## Description
OSSB is single-mindedly trying to enable simple crowd funding mechanisms for OSS development that can be utilized by any project.

### The problem we are trying to solve
We all know how open source projects struggle to get needed funding and that is even with a plethora of options for donations whether it be a "buy me a coffee" button or developers having to spend time drumming up a sponsorship deal with a large company. 

### How we plan to solve it
OSS development already requires some level of building out in the open and every project worth building has a goal that needs to be clearly articulated in order to be achieved. Builders will need to describe the goal before they can start on the project so that users will see the goal of the project and envision the benefits it will bring to their lives and may support the project with a small donation. Another spin on this would be a user sees a feature that is desperately needed in a project and so they submit an issue. Other users who would also like to see the feature donate small sums until the project team - or outsiders - notice the bounty and fulfill the task. Crowd funded, demand driven project development enabled! 
We would like to make this an embeddable mechanism that can be added to these areas:
- Project repository ReadMe
- Issue/Feature submission forms
- Individual developer comments and their profiles

#### The tech
Current funding solutions rely on gated payment rails and are needlessly exclusive. They also require filling out payment information in various unsexy ways. This project will enable 2 click donations through a seamless web3 enabled payment experience. We plan to build using Ethereum L2 Base because of its ease of onboarding users from existing traditional permissioned payment rails to the global payment rails provided by Ethereum. We will also consider utilizing fiat onramps such as MoonPay and Sardine but this would not be in a first iteration.

Everything settles onchain. There will be smart contracts that support the creation of bounties and the distribution of funds. This means that every funder, acceptance threshold approver and fund receiver is defined onchain. There will be contracts for "upon completion" payouts and ones for general funding that can be used however the receiver wants. We would also like to innovate on the wallet front and make it possible for people who are not yet crypto-native to receive funds for individual contributions as small as leaving a helpful comment.

Iframes, Iframes everywhere.

# What we need to build (and how you can help)
- [ ] Contracts for "upon completion" payouts
- [ ] Contracts for donations made to people who don't have an address (We will notify them of the funds and help them get access, there will probably be a unlock period if they remain unclaimed)
- [ ] Research contracts for managing git account and address relationships (could we use Base-native ENS names for this?)
- [ ] Audit smart contracts
- [ ] Design the crowd fund and individual donation iframes (would love help with this as it is not my skill set)
- [ ] Implement iframe designs
- [ ] Backend for sending notifications to users when things happen onchain, other helpful tasks

## Bat Signal 🦇 🔦
- We are looking for someone who wants to help with designing the donation iframes. Any help and guidance here would be 🔥
- If they exist, we would love to have someone who is good at Foundry tooling help with writing and testing the contracts