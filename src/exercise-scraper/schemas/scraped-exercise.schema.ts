import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ScrapedExerciseDocument = ScrapedExercise & Document;

@Schema()
export class ScrapedExercise {
  @Prop({ required: true })
  exerciseId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], default: [] })
  bodyParts: string[];

  @Prop({ type: [String], default: [] })
  equipments: string[];

  @Prop({ required: true })
  gifUrl: string;

  @Prop({ type: [String], default: [] })
  targetMuscles: string[];

  @Prop({ type: [String], default: [] })
  secondaryMuscles: string[];

  @Prop({ type: [String], default: [] })
  instructions: string[];
}

export const ScrapedExerciseSchema =
  SchemaFactory.createForClass(ScrapedExercise);
