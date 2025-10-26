function mapUserToUserResponse(user) {
  return {
    name: user.name,
    email: user.email,
    phoneNumber: user.phone_number,
    placeOfBirth: user.place_of_birth,
    dateOfBirth: user.date_of_birth,
    position: user.position,
    skills: user.skills,
    manager_id: user.manager_id,
    role: user.role,
  };
}

const userDto = { mapUserToUserResponse };

module.exports = userDto;
