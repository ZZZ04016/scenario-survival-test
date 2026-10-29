import { useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getAIService } from '../../services/aiService';

export function ImageUploadView() {
  const { worldview, setUserImage, startQuiz, setStage } = useAppStore();
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 限制图片大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      setError('图片太大了，请选择 5MB 以内的图片');
      return;
    }

    setError(null);
    setAnalyzing(true);

    try {
      // 转为 base64
      const base64 = await fileToBase64(file);
      setPreview(base64);

      // 调用 AI 视觉分析
      const aiService = getAIService();
      const description = await aiService.analyzeImage(base64);

      setUserImage({ base64, description });
    } catch (err) {
      // 视觉分析失败时，使用通用描述降级，不阻塞流程
      setUserImage({
        base64: preview ?? '',
        description: '一位气质独特的年轻人，眼神中透着故事感',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSkip = () => {
    setUserImage(null);
    startQuiz();
  };

  const handleStartQuiz = () => {
    startQuiz();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 animate-fade-in">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">📸</div>
        <h1 className="text-2xl font-serif font-bold text-text mb-2">
          上传你的照片
        </h1>
        <p className="text-text-secondary mb-6 text-sm leading-relaxed">
          AI 将基于你的照片特征，结合答题选择，为你生成独一无二的专属剧情和角色画像
          <br />
          <span className="text-text-muted">(可选，不上传也能玩)</span>
        </p>

        {/* 上传区域 */}
        <div
          className="card p-6 mb-4 cursor-pointer hover:border-primary transition-colors"
          style={{ borderStyle: 'dashed', borderWidth: 2 }}
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            <div>
              <img
                src={preview}
                alt="预览"
                className="max-h-64 mx-auto rounded-lg mb-3 object-cover"
              />
              {analyzing ? (
                <p className="text-primary text-sm animate-pulse">
                  ✨ AI 正在识别你的特征...
                </p>
              ) : (
                <p className="text-text-secondary text-sm">
                  ✅ 照片已识别，点击重新选择
                </p>
              )}
            </div>
          ) : (
            <div className="py-8">
              <div className="text-5xl mb-3">🖼️</div>
              <p className="text-text-secondary">点击上传你的照片</p>
              <p className="text-text-muted text-xs mt-1">支持 JPG / PNG，最大 5MB</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {error && (
          <p className="text-sm mb-4" style={{ color: '#e94560' }}>{error}</p>
        )}

        {/* 按钮区 */}
        <div className="flex gap-3">
          <button onClick={handleSkip} className="btn-secondary flex-1">
            跳过
          </button>
          <button
            onClick={handleStartQuiz}
            disabled={analyzing}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {analyzing ? '识别中...' : '开始答题 →'}
          </button>
        </div>

        {worldview && (
          <button
            onClick={() => setStage('worldview-select')}
            className="mt-6 text-sm text-text-muted hover:text-primary"
          >
            ← 重新选择世界观
          </button>
        )}
      </div>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
