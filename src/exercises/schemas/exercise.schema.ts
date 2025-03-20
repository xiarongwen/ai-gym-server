import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExerciseDocument = Exercise & Document;

@Schema()
export class Exercise {
  @Prop()
  bodyPart: string;

  @Prop()
  equipment: string;

  @Prop()
  gifUrl: string;

  @Prop()
  id: number;

  @Prop()
  name: string;

  @Prop()
  target: string;

  @Prop({ type: [String] })
  secondaryMuscles: string[];

  @Prop({ type: [String] })
  instructions: string[];
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);
