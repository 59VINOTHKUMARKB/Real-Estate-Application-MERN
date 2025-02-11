import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
export const getUsers = async(req,res)=>
{
    console.log('getUsers');
    try{
        const users =await prisma.user.findMany();
        res.status(200).json(users);
    }
    catch(err){
        console.log(err);
        res.status(500).json({message: "Failed to get Users!"});
    }
}

export const getUser = async(req,res)=>
{
    console.log('getUser');
    const id=req.params.id;
    try{
        const users =await prisma.user.findUnique(
            {
                where:{ id }
            }
        );
        res.status(200).json(users);
    }
    catch(err){
        console.log(err);
        res.status(500).json({message: "Failed to get User!"});
    }
}

export const updateUser = async(req,res)=>
{
    const id=req.params.id;
    const tokenUserId=req.userId;
    const {password,avatar,...inputs}=req.body;

    if(id!==tokenUserId){
        return res.status(403).json({message:"Not Authorized"});
    }
    let updatedPassword = null;
    try{
        if(password)
            {
                updatedPassword = await bcrypt.hash(password,10);
            }
        const updatedUser = await prisma.user.update({
            where:{id},
        data:{
            ...inputs,
            ...(updatedPassword && {password:updatedPassword}),
            ...(avatar &&{avatar})
        }
        })
        res.status(200).json(updatedUser);
    }
    catch(err){
        console.log(err);
        res.status(500).json({message: "Failed to Update Users!"});
    }
}

export const deleteUser = async(req,res)=>
{
    const id=req.params.id;
    const tokenUserId=req.userId;

    if(id!==tokenUserId){
        return res.status(403).json({message:"Not Authorized"});
    }

    try{
        await prisma.user.delete(
            {
                where:{id}
            }
        )
        res.status(200).json({message:"User Deleted"});
    }
    catch(err){
        console.log(err);
        res.status(500).json({message: "Failed to Delete Users!"});
    }
}

export const savePost = async (req, res) => {
    console.log('Saving post');
    const postId = req.body.postId;
    const tokenUserId = req.body.userId;

    if (!postId || !tokenUserId) {
        return res.status(400).json({ message: "Post ID and User ID are required!" });
    }

    try {
        const savedPost = await prisma.savedPost.findUnique({
            where: {
                userId_postId: {
                    userId: tokenUserId,
                    postId
                }
            }
        });

        if (savedPost) {
            await prisma.savedPost.delete({
                where: {
                    id: savedPost.id,
                }
            });
            res.status(200).json({ message: "Post Removed from Saved List!" });
        } else {
            await prisma.savedPost.create({
                data: {
                    userId: tokenUserId,
                    postId,
                }
            });
            res.status(200).json({ message: "Post Saved to Saved List!" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to Save Post!" });
    }
};

export const profilePosts = async(req,res)=>
{
    const tokenUserId=req.userId;
    console.log(tokenUserId)
    try{
        const userPosts =await prisma.post.findMany(
            {
                where:{ userId:tokenUserId }
            }
        );
        console.log(userPosts);
        
        const saved = await prisma.savedPost.findMany({
            where:{ userId:tokenUserId},
            include:{
                post:true
            }
        })
        console.log(saved);
        
        const savedPosts = saved.length > 0 ? saved.map(item => item.post) : [];
        res.status(200).json({userPosts,savedPosts});
    }
    catch(err){
        console.log(err);
        res.status(500).json({message: "Failed to get ProfilePosts!"});
    }
}

export const getNotificationNumber = async (req, res) => {
    const tokenUserId = req.userId;
    try {
      const number = await prisma.chat.count({
        where: {
          userIDs: {
            hasSome: [tokenUserId],
          },
          NOT: {
            seenBy: {
              hasSome: [tokenUserId],
            },
          },
        },
      });
      res.status(200).json(number);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Failed to get profile posts!" });
    }
};

export const getsavedStatus = async (req, res) => {
    const { userId, postId } = req.query;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { savedPosts: true },
        });
        const isSaved = user.savedPosts.includes(postId);
        res.status(200).json({ isSaved });
    } catch (err) {
        console.error('Error checking saved status:', err);
        res.status(500).json({ message: "Failed to check saved status" });
    }
}