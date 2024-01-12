import moment from 'moment'
const state = {
  data: {
    message: [
      {
        date: '2023-01-13',
        font: 'fs-red',
        text: 'Patient 0952214 De Jesus Juan CT Scan Results has been uploaded to Edify.'
      }
    ]
  }
}

const mutations = {
  addMessage: (state, payload) => {
    const dateNow = moment()
    const terminalText = {
      date: moment(dateNow).format('YYYY-MM-DD'),
      font: payload.font,
      text: payload.text
    }
    state.data.message.push(terminalText)
  }
}

const actions = {}

const getters = {
  getMessage: (state) => state.data.message
}

export default {
  state,
  mutations,
  actions,
  getters
}
