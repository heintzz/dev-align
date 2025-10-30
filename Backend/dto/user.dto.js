function mapUserToUserResponse(user) {
  // If managerId is populated (object), expose a manager object with key info
  const managerObj = user && user.managerId && typeof user.managerId === 'object' && (user.managerId.name || user.managerId.email)
    ? {
      id: user.managerId._id || user.managerId.id,
      name: user.managerId.name,
      email: user.managerId.email,
      phoneNumber: user.managerId.phoneNumber,
      position: user.managerId.position,
    }
    : null;

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    placeOfBirth: user.placeOfBirth,
    dateOfBirth: user.dateOfBirth,
    position: user.position,
    skills: user.skills,
    // keep managerId as id (if populated, extract its id)
    managerId: user && user.managerId && typeof user.managerId === 'object' ? (user.managerId._id || user.managerId.id) : user.managerId,
    // manager: null or {id,name,email,phoneNumber,position}
    manager: managerObj,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    active: user.active,
  };
}

const userDto = { mapUserToUserResponse };

module.exports = userDto;
