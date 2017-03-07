const Boom = require('boom')
const Person = require('./../models/person')

function inPersonalScope (request, reply) {
  if (request.payload.person !== request.auth.credentials.id) {
    reply(Boom.forbidden())
    return false
  }
  return true
}

function follow (request, reply) {
  if (inPersonalScope(request, reply)) {
    Person.findById(request.auth.credentials.id)
    .then(person => {
      // make sure not alraedy following
      if (person.followings.find(el => el.project === request.payload.project)) {
        reply(Boom.conflict())
        return null
      } else {
        person.followings.push(request.payload)
        return person.save()
      }
    }).then(person => {
      if (person) {
        reply(person.followings.id(request.params.id))
      }
    }).catch(err => { throw err })
  }
}

function unfollow (request, reply) {
  // TODO: 403 if attempted to remove someone else's following
  Person.findById(request.auth.credentials.id)
  .then(person => {
    person.followings.id(request.params.id).remove()
    return person.save()
  }).then(result => reply().code(204))
  .catch(err => { throw err })
}

module.exports = {
  follow,
  unfollow
}
