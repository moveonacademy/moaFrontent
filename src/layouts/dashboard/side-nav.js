/* eslint-disable complexity */
/* eslint-disable arrow-spacing */
/* eslint-disable no-await-in-loop */
/* eslint-disable arrow-parens */
/* eslint-disable arrow-spacing */
/* eslint-disable prefer-const */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-console */
/* eslint-disable no-useless-concat */
/* eslint-disable prefer-template */
/* eslint-disable arrow-spacing */
/* eslint-disable prefer-template */
/* eslint-disable no-dupe-keys */
/* eslint-disable prefer-template */

/* eslint-disable eqeqeq */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable array-callback-return */


/* eslint-disable no-loop-func */
/* eslint-disable no-inline-comments */
/* eslint-disable no-inline-comments */

import { usePathname } from 'next/navigation';
import PropTypes from 'prop-types';
import {
  Box,
  Divider,
  Drawer,
  Stack,
  Typography,
  useMediaQuery
} from '@mui/material';
import { Logo } from 'src/components/logo';
import { Scrollbar } from 'src/components/scrollbar';
import { itemsTeacher,itemsRegular,itemsStudent,itemsManagerMoveOn, itemsAfterSchool, itemsMoveOnSchool, itemsTeacherMoveOn, itemsChatbot } from './config';
import { itemsAdmin } from './config';
import { itemsManagers } from './config';
import { itemsAdminPro } from './config';
import { itemsSupport } from './config';
import {  useEffect, useState } from 'react';

import { SideNavItem } from './side-nav-item';
import {useMoralis} from "react-moralis"

export const SideNav = (props) => {
  const { open, onClose } = props;
  const pathname = usePathname();
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
 
 const {Moralis,isAuthenticated,user}=useMoralis()
 const [isManager,setIsManager]=useState(false)
 const [isAdmin,setIsAdmin]=useState(false)
 const [isTeacher,setIsTeacher]=useState(false)
 const [isTeacherMoveOn,setIsTeacherMoveOn]=useState(false)
 const [isSupport,setIsSupport]=useState(false)
 const [isChatbot,isSetChatbot]=useState(false)

 const [isStudent,setIsStudent]=useState(false)
 const [isAfterSchool,setIsAfterSchool]=useState(false)
 const [isMoveOnSchool,setIsMoveOnSchool]=useState(false)
 const [isRegular,setIsRegular]=useState(false)

const [,setEmail]=useState("")
  useEffect(
    () => {
async function init(){
  let user=await Moralis.User.current()

if(user.get("email")){
console.log("text")
  setEmail(user.get("email"))
  
  const query = new Moralis.Query("Moderators");
   query.equalTo("email",user.get("email"))
itemsManagerMoveOn
  const moderator = await query.first();
console.log(JSON.stringify(user.get("email")))

if(user.get("email").toLowerCase()==="moachatbot@gmail.com"){
    
  isSetChatbot(true)
  return
}

  if(user.get("email")==="sistemamoa2023@gmail.com"){
    
    setIsAdmin(true)
    return
  }
  
   setIsAdmin(false)

  setIsAfterSchool(false)

  setIsMoveOnSchool(false)
  setIsManager(false)
  
  const query2 = new Moralis.Query("Teachers");
  await query2.equalTo("teacherEmail",user.get("email"))

  const teacher = await query2.first();
  if(teacher){

    setIsTeacher(true)
    
    setIsStudent(false)
    setIsManager(false)
    return
  }

  const query22 = new Moralis.Query("TeachersMoveOn");
  await query22.equalTo("teacherEmail",user.get("email"))

  const teacher22 = await query22.first();
 

  const query3 = new Moralis.Query("Students");
  await query3.equalTo("studentEmail",user.get("email"))
  
  const student = await query3.first();

  const query5 = new Moralis.Query("Managers");
  await query5.equalTo("managerEmail",user.get("email"))
  
  const managerquery = await query5.first();
  const query6 = new Moralis.Query("CustomerSupport");
  await query6.equalTo("customerSupportEmail",user.get("email"))
  
  const supportquery = await query6.first();
  
  console.log("managermanager "+JSON.stringify(managerquery))
  if(managerquery){

    setIsStudent(false)
    setIsRegular(false)

    setIsTeacher(false)
    setIsManager(true)
    return
  }
  if(teacher22){

    setIsTeacher(false)
    console.log("text3")

    setIsStudent(false)
    setIsManager(false)
    setIsTeacherMoveOn(true)
    return
  }
  if(student){

    setIsStudent(true)
    setIsRegular(false)

    setIsTeacher(false)
    setIsManager(false)
    return
  }
  if(moderator?.attributes.typeOfUser==="moveOnSchool"){

    setIsStudent(false)

    setIsManager(false)
    setIsAfterSchool(false)  
      setIsMoveOnSchool(true)
      setIsRegular(false)

    setIsTeacher(false)
return
  }
  if(supportquery){

    setIsStudent(false)
    setIsRegular(false)
    setIsSupport(true)

    setIsManager(false)
    setIsTeacher(false)
return
  }

  if(moderator?.attributes.typeOfUser==="afterSchool"){

    setIsStudent(false)
    setIsRegular(false)

    setIsManager(false)
    setIsAfterSchool(true)
    setIsTeacher(false)
return
  }

  if(moderator?.attributes.typeOfUser==="admin"){

    setIsStudent(false)

    setIsManager(false)
    setIsAfterSchool(false)  
      setIsAdmin(true)
      setIsRegular(false)

      setIsMoveOnSchool(false)
    setIsTeacher(false)
    

  }    else{
    setIsRegular(true)

  } 
}
 }


      init()
      },
    []
  );

  const content = (
    <Scrollbar
      sx={{
        height: '100%',
        '& .simplebar-content': {
          height: '100%'
        },
        '& .simplebar-scrollbar:before': {
          background: 'neutral.400'
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box
            href="/"
            sx={{
              display: 'inline-flex',
              height: 60,
              width: 300
            }}
          >
            <Logo />
          </Box>
          <Box
            sx={{
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderRadius: 1,
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              mt: 2,
              p: '12px'
            }}
          >
            <div>
              <Typography
                color="inherit"
                variant="subtitle1"
              >
                MoveOnAcademy
              </Typography>
              <Typography
                color="neutral.400"
                variant="body2"
              >
                Systema MOA
              </Typography>
            </div>
          
          </Box>
        </Box>
        <Divider sx={{ borderColor: 'neutral.700' }} />
        <Box
          component="nav"
          sx={{
            flexGrow: 1,
            px: 2,
            py: 3
          }}
        >
          <Stack
            component="ul"
            spacing={0.5}
            sx={{
              listStyle: 'none',
              p: 0,
              m: 0
            }}
          >
            {isAdmin?user?.get("email")==="golfredo.pf@gmail.com"||user.get("email")==="sistemamoa2023@gmail.com"?itemsAdminPro.map((item) => {
              const active = item.path ? (pathname === item.path) : false;

              return (
                <SideNavItem
                  active={active}
                  disabled={item.disabled}
                  external={item.external}
                  icon={item.icon}
                  key={item.title}
                  path={item.path}
                  title={item.title}
                />
              );
            }):itemsAdmin.map((item) => {
              const active = item.path ? (pathname === item.path) : false;

              return (
                <SideNavItem
                  active={active}
                  disabled={item.disabled}
                  external={item.external}
                  icon={item.icon}
                  key={item.title}
                  path={item.path}
                  title={item.title}
                />
              );
            }):isManager?itemsManagerMoveOn.map((item) => {
              const active = item.path ? (pathname === item.path) : false;

              return (
                <SideNavItem
                  active={active}
                  disabled={item.disabled}
                  external={item.external}
                  icon={item.icon}
                  key={item.title}
                  path={item.path}
                  title={item.title}
                />
              );
            }):isAfterSchool?itemsAfterSchool.map((item) => {
              const active = item.path ? (pathname === item.path) : false;

              return (
                <SideNavItem
                  active={active}
                  disabled={item.disabled}
                  external={item.external}
                  icon={item.icon}
                  key={item.title}
                  path={item.path}
                  title={item.title}
                />
              );
            }):isMoveOnSchool?itemsMoveOnSchool.map((item) => {
              const active = item.path ? (pathname === item.path) : false;

              return (
                <SideNavItem
                  active={active}
                  disabled={item.disabled}
                  external={item.external}
                  icon={item.icon}
                  key={item.title}
                  path={item.path}
                  title={item.title}
                />
              );
            }):isStudent?itemsStudent.map((item) => {
              const active = item.path ? (pathname === item.path) : false;

              return (
                <SideNavItem
                  active={active}
                  disabled={item.disabled}
                  external={item.external}
                  icon={item.icon}
                  key={item.title}
                  path={item.path}
                  title={item.title}
                />
              );
            }):isTeacher?itemsTeacher.map((item) => {
              const active = item.path ? (pathname === item.path) : false;

              return (
                <SideNavItem
                  active={active}
                  disabled={item.disabled}
                  external={item.external}
                  icon={item.icon}
                  key={item.title}
                  path={item.path}
                  title={item.title}
                />
              );
            }):isRegular?itemsRegular.map((item) => {
              const active = item.path ? (pathname === item.path) : false;

              return (
                <SideNavItem
                  active={active}
                  disabled={item.disabled}
                  external={item.external}
                  icon={item.icon}
                  key={item.title}
                  path={item.path}
                  title={item.title}
                />
              );
            }):isTeacherMoveOn?itemsTeacherMoveOn.map((item) => {
              const active = item.path ? (pathname === item.path) : false;

              return (
                <SideNavItem
                  active={active}
                  disabled={item.disabled}
                  external={item.external}
                  icon={item.icon}
                  key={item.title}
                  path={item.path}
                  title={item.title}
                />
              );
            }):isSupport?itemsSupport.map((item) => {
              const active = item.path ? (pathname === item.path) : false;

              return (
                <SideNavItem
                  active={active}
                  disabled={item.disabled}
                  external={item.external}
                  icon={item.icon}
                  key={item.title}
                  path={item.path}
                  title={item.title}
                />
              );
            }):isChatbot?itemsChatbot.map((item) => {
              const active = item.path ? (pathname === item.path) : false;

              return (
                <SideNavItem
                  active={active}
                  disabled={item.disabled}
                  external={item.external}
                  icon={item.icon}
                  key={item.title}
                  path={item.path}
                  title={item.title}
                />
              );
            }):[].map((item) => {
              const active = item.path ? (pathname === item.path) : false;

              return (
                <SideNavItem
                  active={active}
                  disabled={item.disabled}
                  external={item.external}
                  icon={item.icon}
                  key={item.title}
                  path={item.path}
                  title={item.title}
                />
              );
            })}
          </Stack>
        </Box>
        <Divider sx={{ borderColor: 'neutral.700' }} />
        <Box
          sx={{
            px: 2,
            py: 3
          }}
        >
      
        </Box>
      </Box>
    </Scrollbar>
  );

  if (lgUp) {
    return (
      <Drawer
        anchor="left"
        open
        PaperProps={{
          sx: {
            backgroundColor: 'neutral.800',
            color: 'common.white',
            width: 280
          }
        }}
        variant="permanent"
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="left"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          backgroundColor: 'neutral.800',
          color: 'common.white',
          width: 280
        }
      }}
      sx={{ zIndex: (theme) => theme.zIndex.appBar + 100 }}
      variant="temporary"
    >
      {content}
    </Drawer>
  );
};

SideNav.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool
};