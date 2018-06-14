import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

import React from 'react';
import { compose } from 'recompose';

import { withEither, isLoading, Loading } from '/imports/ui/util/uiUtil.jsx';
import PermissionSelect from '/imports/ui/util/PermissionSelect.jsx';

const adminUsersDataTracker = () => {
  const userSub = Meteor.subscribe('users');
  const loading = !userSub.ready();
  const users = Meteor.users.find({}).fetch();
  return {
    users
  }
}

const withConditionalRendering = compose(
  withTracker(adminUsersDataTracker),
  withEither(isLoading, Loading)
)

const AdminUserInfo = ({ _id, username, emails, profile, createdAt, roles, ...user }) => {
  const { first_name, last_name } = profile;
  return <tr>
    <td>
      <a href={`/admin/user/${_id}`} > 
        {username}
      </a>
    </td>
    <td>{first_name} {last_name}</td>
    <td>{ /*emails*/ }</td>
    <td>{ /*createdAt.toString()*/ }</td>
    <td>
      <PermissionSelect permissions={roles} disabled={true} />
    </td>
    <td>
      
    </td>
  </tr>
}

class AdminUsers extends React.Component {
  constructor(props){
    super(props)
  }
  render(){
    const { users } = this.props;
    return (
      <div className="mt-2">
        <table className="table table-hover table-sm">
          <thead>
            <tr>
              {
                ['Username','Full name','E-mail','Created at','User groups','Actions'].map(label => {
                  return <th key={label} id={label}>
                    <button className='btn btn-sm btn-outline-dark px-2 py-0' disabled>
                      {label}
                    </button>
                  </th>
                })
              }
            </tr>
          </thead>
          <tbody>
            {
              users.map(user => {
                return <AdminUserInfo key={user._id} {...user} />
              })
            }
          </tbody>
        </table>
      </div>
    )
  }
}

export default withConditionalRendering(AdminUsers);