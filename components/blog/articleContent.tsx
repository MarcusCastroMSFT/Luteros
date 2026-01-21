import React from 'react';

interface ArticleContentProps {
  content?: string;
  className?: string;
}

export function ArticleContent({ 
  content = generateSampleContent(),
  className = ''
}: ArticleContentProps) {
  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      <div 
        className="text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}

// Sample content generator for demonstration
function generateSampleContent(): string {
  return `
    <p>A educação sexual é um tema fundamental que deve ser abordado de forma responsável e científica. É essencial que jovens e adultos tenham acesso a informações precisas sobre sexualidade, saúde reprodutiva e relacionamentos saudáveis.</p>
    
    <h2>Por que a Educação Sexual é Importante?</h2>
    
    <p>A educação sexual adequada proporciona diversos benefícios para o desenvolvimento humano:</p>
    
    <ul>
      <li><strong>Prevenção de doenças:</strong> Conhecimento sobre ISTs e métodos de prevenção</li>
      <li><strong>Planejamento familiar:</strong> Informações sobre métodos contraceptivos</li>
      <li><strong>Relacionamentos saudáveis:</strong> Desenvolvimento de habilidades de comunicação</li>
      <li><strong>Autoconhecimento:</strong> Compreensão do próprio corpo e sexualidade</li>
    </ul>
    
    <blockquote>
      <p>"A educação sexual não é apenas sobre sexo, mas sobre formar indivíduos conscientes e responsáveis em relação à sua sexualidade e aos seus relacionamentos."</p>
    </blockquote>
    
    <h2>Como Implementar a Educação Sexual</h2>
    
    <p>A implementação efetiva da educação sexual requer uma abordagem multidisciplinar que envolva:</p>
    
    <ol>
      <li><strong>Família:</strong> Diálogo aberto e respeitoso em casa</li>
      <li><strong>Escola:</strong> Programas educacionais estruturados</li>
      <li><strong>Profissionais de saúde:</strong> Orientação médica especializada</li>
      <li><strong>Sociedade:</strong> Campanhas de conscientização pública</li>
    </ol>
    
    <h3>Principais Desafios</h3>
    
    <p>Apesar da importância, a educação sexual ainda enfrenta diversos desafios:</p>
    
    <ul>
      <li>Tabus culturais e religiosos</li>
      <li>Falta de preparo dos educadores</li>
      <li>Resistência de pais e responsáveis</li>
      <li>Informações inadequadas nas mídias sociais</li>
    </ul>
    
    <h2>Benefícios a Longo Prazo</h2>
    
    <p>Investir em educação sexual de qualidade gera benefícios que se estendem por toda a vida:</p>
    
    <p>Jovens que recebem educação sexual adequada demonstram maior capacidade de tomar decisões informadas sobre sua saúde sexual e reprodutiva. Eles também desenvolvem relacionamentos mais saudáveis e têm menores taxas de gravidez não planejada e ISTs.</p>
    
    <h3>Impacto na Sociedade</h3>
    
    <p>Além dos benefícios individuais, a educação sexual contribui para:</p>
    
    <ul>
      <li>Redução da violência sexual</li>
      <li>Diminuição da discriminação por orientação sexual</li>
      <li>Melhoria na saúde pública</li>
      <li>Fortalecimento das estruturas familiares</li>
    </ul>
    
    <h2>Conclusão</h2>
    
    <p>A educação sexual é um direito fundamental que deve ser garantido a todas as pessoas. É através do conhecimento e da informação que construímos uma sociedade mais justa, saudável e respeitosa.</p>
    
    <p>É essencial que continuemos a promover discussões abertas e científicas sobre este tema, sempre priorizando o bem-estar e a dignidade de todos os indivíduos.</p>
  `;
}
