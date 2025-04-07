import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const CreateNewCheckpoint = mutation({
    args:{
        roomId: v.id('DiscussionRoom'),
        checkpointData: v.any(),
        timestamp: v.string(),
        uid: v.id('users')
    },
    handler: async(ctx, args) => {
        const result = await ctx.db.insert("Checkpoints", {
            roomId: args.roomId,
            checkpointData: args.checkpointData,
            timestamp: args.timestamp,
            uid: args.uid
        });

        return result;
    }
});

export const GetCheckpoint = query({
    args:{
        id: v.id('Checkpoints')
    },
    handler: async(ctx, args) => {
        const result = await ctx.db.get(args.id);
        return result;
    }
});

export const UpdateCheckpoint = mutation({
    args:{
        id: v.id('Checkpoints'),
        checkpointData: v.any()
    },
    handler: async(ctx, args) => {
        await ctx.db.patch(args.id, {
            checkpointData: args.checkpointData
        });
    }
});

export const GetAllCheckpoints = query({
    args:{
        roomId: v.id('DiscussionRoom')
    },
    handler: async(ctx, args) => {
        const result = await ctx.db.query('Checkpoints')
            .filter(q => q.eq(q.field('roomId'), args.roomId))
            .order('desc')
            .collect();
        return result;
    }
});

export const DeleteCheckpoint = mutation({
    args:{
        id: v.id('Checkpoints')
    },
    handler: async(ctx, args) => {
        await ctx.db.delete(args.id);
    }
}); 